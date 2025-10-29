export interface User {
  id: string;
  email: string;
  name: string;
  region: string;
  free_recipes_used: number;
  is_premium: boolean;
}

export interface Recipe {
  name: string;
  ingredients: string[];
  preparation: string;
  healthBenefit: string;
  portion: string;
  cookingTime: string;
  difficulty: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
}