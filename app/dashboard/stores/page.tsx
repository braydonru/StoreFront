"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {apiClient, Store} from "@/lib/api";
import {
    Users,
    Plus,
    Trash2,
    Shield,
    Loader2,
    X,
    Eye,
    EyeOff, Edit2, Search, Package,
} from "lucide-react";

export default function Stores (){
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [stores, setStores] = useState<Store[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newStoreName, setNewStoreName] = useState("");
    const [newStoreOwner, setNewStoreOwner] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [errorCreating, setErrorCreating] = useState(false);

    useEffect(() => {
        if (currentUser?.role !== "SuperAdmin") {
            router.push("/dashboard");
            return;
        }


    }, [currentUser, router]);

    useEffect(() => {
        const fetchStores = async () =>{
            try {
                const fetchedStores = await apiClient.getStoresWithOwner();
                setStores(fetchedStores);
            }
            catch (error){
                console.error("Error fetching stores", error);
            }
        }
        fetchStores();
    }, []);

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setIsCreating(true);
        try {
            const newStore = await apiClient.createStore(newStoreName, newStoreOwner);

            setShowCreateModal(false);
            setNewStoreName("");
            setNewStoreOwner("")
        } catch (err) {
            setErrorCreating(true);
            setShowCreateModal(false);
            console.error("Error creating store", err);
        } finally {
            setIsCreating(false);
        }
    };


    const handleDelete = async (id: number, user_id:number) => {
        if (!confirm("Estas seguro de eliminar este producto?")) return;

        try {
            await apiClient.deleteStore(id, user_id);
            setStores(stores.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tiendas</h1>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Tienda
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar Tienda..."
                        className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                </div>
            </div>
            {/* Products Table */}

                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    ID
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Nombre
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Dueño
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Acciones
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {stores.map((s) => (
                                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-foreground">{s.id}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-foreground font-medium">
                                            {s.name}
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {s.owner}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                >
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id,currentUser.id)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                            ))}

                            </tbody>
                        </table>
                    </div>
                </div>
            {errorCreating && (
               <div style={{padding:'15px',backgroundColor:'red', width:'23%', borderRadius:'25px',marginTop:'5px', marginLeft:'75%'}}><h1>Error: Usuario no encontrado</h1></div>


            )}
            {/* Create Store Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Nueva Tienda</h3>
                        <form onSubmit={handleCreateStore}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Nombre de la tienda
                                </label>
                                <input
                                    type="text"
                                    value={newStoreName}
                                    onChange={(e) => setNewStoreName(e.target.value)}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                    placeholder="Ej: Mi Tienda Principal"
                                    required
                                />
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    value={newStoreOwner}
                                    onChange={(e) => setNewStoreOwner(e.target.value)}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                    placeholder="Usuario del dueño"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        "Crear Tienda"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}