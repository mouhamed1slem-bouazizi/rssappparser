import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

let db: FirebaseFirestore.Firestore;

// Initialize Firebase Admin if not already initialized
function initializeFirebase() {
  if (getApps().length === 0) {
    // Check if required environment variables are available
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      // During build time, we might not have access to env vars
      // This prevents the build from failing
      if (process.env.NODE_ENV === 'production') {
        console.warn('Firebase credentials not found during build. Database features will be disabled.');
        return null;
      }
      throw new Error('Missing Firebase configuration. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    }

    const serviceAccount = {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };

    try {
      initializeApp({
        credential: cert(serviceAccount),
        projectId,
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      if (process.env.NODE_ENV !== 'production') {
        throw error;
      }
      return null;
    }
  }

  return getFirestore();
}

// Initialize db on module load
try {
  db = initializeFirebase() as FirebaseFirestore.Firestore;
} catch (error) {
  console.error('Database initialization failed:', error);
}

export interface Article {
  id?: string
  title: string
  description: string | null
  link: string
  pub_date: Date | null
  source: string | null
  category: string | null
  image_url: string | null
  summary: string | null
  created_at: Date
  updated_at: Date
}

export interface UserPreferences {
  id?: string
  user_id: string
  preferred_language: string
  preferred_categories: string[]
  created_at: Date
  updated_at: Date
}

export interface CustomCategory {
  id?: string
  user_id: string
  name: string
  keywords: string[]
  created_at: Date
}

// Helper function to check if database is available
function isDatabaseAvailable(): boolean {
  return db !== null && db !== undefined;
}

export async function getArticlesByCategory(category: string, limit = 20): Promise<Article[]> {
  if (!isDatabaseAvailable()) {
    console.warn('Database not available, returning empty articles');
    return [];
  }

  try {
    const articlesRef = db.collection('articles');
    // Remove orderBy to avoid composite index requirement
    // We'll sort the results in memory instead
    const query = articlesRef
      .where('category', '==', category)
      .limit(limit * 2); // Get more results to have enough after sorting
    
    const snapshot = await query.get();
    
    const articles = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        pub_date: data.pub_date?.toDate() || null,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      } as Article;
    });

    // Sort by pub_date in memory and limit results
    return articles
      .sort((a, b) => {
        const dateA = a.pub_date || a.created_at;
        const dateB = b.pub_date || b.created_at;
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return [];
  }
}

export async function getAllArticles(limit = 50): Promise<Article[]> {
  if (!isDatabaseAvailable()) {
    console.warn('Database not available, returning empty articles');
    return [];
  }

  try {
    const articlesRef = db.collection('articles');
    // Use created_at for ordering since it's more likely to have an automatic index
    const query = articlesRef
      .orderBy('created_at', 'desc')
      .limit(limit);
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        pub_date: data.pub_date?.toDate() || null,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      } as Article;
    });
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }
}

export async function insertArticle(article: Omit<Article, "id" | "created_at" | "updated_at">): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.warn('Database not available, skipping article insertion');
    return;
  }

  try {
    const articlesRef = db.collection('articles');
    
    // Check if article with the same link already exists
    const existingQuery = await articlesRef.where('link', '==', article.link).get();
    
    const now = Timestamp.now();
    const articleData = {
      ...article,
      pub_date: article.pub_date ? Timestamp.fromDate(article.pub_date) : null,
      created_at: now,
      updated_at: now,
    };
    
    if (!existingQuery.empty) {
      // Update existing article
      const existingDoc = existingQuery.docs[0];
      await existingDoc.ref.update({
        title: article.title,
        description: article.description,
        updated_at: now,
      });
    } else {
      // Create new article
      await articlesRef.add(articleData);
    }
  } catch (error) {
    console.error('Error inserting article:', error);
    throw error;
  }
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (!isDatabaseAvailable()) {
    console.warn('Database not available, returning null for user preferences');
    return null;
  }

  try {
    const preferencesRef = db.collection('user_preferences');
    const query = await preferencesRef.where('user_id', '==', userId).get();
    
    if (query.empty) {
      return null;
    }
    
    const doc = query.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      created_at: data.created_at?.toDate() || new Date(),
      updated_at: data.updated_at?.toDate() || new Date(),
    } as UserPreferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.warn('Database not available, skipping user preferences update');
    return;
  }

  try {
    const preferencesRef = db.collection('user_preferences');
    const query = await preferencesRef.where('user_id', '==', userId).get();
    
    const now = Timestamp.now();
    const preferenceData = {
      user_id: userId,
      preferred_language: preferences.preferred_language || "en",
      preferred_categories: preferences.preferred_categories || ["Technology", "World News"],
      updated_at: now,
    };
    
    if (query.empty) {
      // Create new preferences
      await preferencesRef.add({
        ...preferenceData,
        created_at: now,
      });
    } else {
      // Update existing preferences
      const existingDoc = query.docs[0];
      await existingDoc.ref.update(preferenceData);
    }
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

export async function getCustomCategories(userId: string): Promise<CustomCategory[]> {
  if (!isDatabaseAvailable()) {
    console.warn('Database not available, returning empty custom categories');
    return [];
  }

  try {
    const categoriesRef = db.collection('custom_categories');
    const query = await categoriesRef.where('user_id', '==', userId).get();
    
    return query.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate() || new Date(),
      } as CustomCategory;
    });
  } catch (error) {
    console.error('Error fetching custom categories:', error);
    return [];
  }
}

export async function createCustomCategory(category: Omit<CustomCategory, "id" | "created_at">): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.warn('Database not available, skipping custom category creation');
    return;
  }

  try {
    const categoriesRef = db.collection('custom_categories');
    const now = Timestamp.now();
    
    await categoriesRef.add({
      ...category,
      created_at: now,
    });
  } catch (error) {
    console.error('Error creating custom category:', error);
    throw error;
  }
}
