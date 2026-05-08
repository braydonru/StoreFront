const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LoginResponse {
  access_token: string;
  username: string;
  role: string;
  id: number;
}

export interface User {
  id?: number;
  name: string;
  username: string;
  password: string;
  store_id?: number;
  role: string;
}


export interface Store {
  id: number;
  name: string;
  owner: number;
}

export interface Product {
  name: string;
  description: string;
  price: number;
  acquisition_price: number;
  stock: number;
  store_id?: number;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/product/get_product`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error desconocido" }));
      throw new Error(error.detail || "Error en la solicitud");
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/security/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error desconocido" }));
      throw new Error(error.detail || "Credenciales incorrectas");
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async getProfile(): Promise<User> {
    return this.request<User>("/security/login/profile");
  }

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users/get_user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`,
      }
    })
    return await res.json();
  }

  async getUsersByStore(id:number): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users/get_user_by_store?store_id=${id}`)
    const users = await res.json();
    return users;
  }


  async createUser(user: { name: string; username: string; password: string; store_id : number }):Promise<User> {
    return this.request("/users/create_user", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async createWorker(user: User): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/create_worker?store_id=${user.store_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({
        "name": user.name,
        "username": user.username,
        "password": user.password,
        "store_id": user.store_id,
        "role": user.role,
      }),
    })
    return user;
  }

  async setUserRole(id: number, role: string) {
    return this.request(`/users/set_role?role=${role}&id=${id}`, {
      method: "PUT",
    });
  }

  async deleteUser(id: number) {
    return this.request(`/users/delete_user?id=${id}`, {
      method: "DELETE",
    });
  }

  // Stores
  async getStores(): Promise<Store[]> {
    const stores = await fetch(`${API_BASE_URL}/store/get_store`);

    return await stores.json();
  }

  async getStoresByOwner(ownerId: number): Promise<Store[]> {
    const stores = await fetch(`${API_BASE_URL}/store/get_store_by_owner?owner_id=${ownerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })


    return await stores.json();
  }

  async getStoresWithOwner(): Promise<Store[]> {
    const stores = await fetch(`${API_BASE_URL}/store/get_all_stores`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    return await stores.json();
  }

  async getWorkingStore(user_id: number): Promise<Store[]> {
    const stores = await fetch(`${API_BASE_URL}/store/get_working_store?user_id=${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })


    return await stores.json();
  }

  async createStore(name: string, ownerusername: string): Promise<Store> {
    const response = await fetch(`${API_BASE_URL}/store/create_store?owner_username=${ownerusername}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({
        name,
        owner_username: ownerusername,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Error desconocido",
      }));
      throw new Error(error.detail || "Error en la solicitud");
    }

    return response.json();
  }

  async deleteStore(storeId: number, ownerId: number) {
    try{
      const res = await fetch(`${API_BASE_URL}/store/delete_store?store_id=${storeId}&owner_id=${ownerId}`, {
      method: "DELETE",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`,
      }
    });
    }
    catch (error) {
      console.error(error);
    }
  }


  async getProducts(storeId?: number): Promise<Product[]> {
    const res = await fetch(`${API_BASE_URL}/product/get_product?store_id=${storeId}`, {
      headers: {
        "Content-Type": "application/json",
      }
    })
    const products = await res.json();

    return products;
  }

  async createProduct(product: Product): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/product/create_product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "acquisition_price": product.acquisition_price,
        "stock": product.stock,
        "store_id": product.store_id,
      }),
    })
    return product;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    // This would be the actual API call
    return { id, ...product } as Product;
  }

  async deleteProduct(id: number): Promise<void> {
    // This would be the actual API call
    return;
  }
}

export const apiClient = new ApiClient();
