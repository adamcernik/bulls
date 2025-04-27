export interface Product {
  id: string;
  model: string;
  category: string;
  price: number;
  battery: string;
  motor: string;
  range: string;
  weight: number;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
} 