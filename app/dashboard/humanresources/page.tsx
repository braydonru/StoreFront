"use client";

import {useEffect, useState} from "react";
import {Edit2, Loader2, Plus, Trash2, X} from "lucide-react";
import {apiClient, Product, User} from "@/lib/api";
import {useStore} from "@/contexts/store-context";

export default function HRPage ()  {
    const [showModal, setShowModal] = useState(false);
    const { selectedStore } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<User[]>([]);
    const [userslist, setUserslist] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        role:""
    });


    useEffect(() => {
        const fetchUsersByStore = async () => {
            if (!selectedStore) return;

            try {
                setLoading(true);
                const fetchedUsers = await apiClient.getUsersByStore(selectedStore?.id);
                setUserslist(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsersByStore();
    }, [selectedStore?.id]);

    const handleDelete = async (id: number) => {
        if (!confirm("Estas seguro de eliminar este Trabajador?")) return;

        try {
            await apiClient.deleteUser(id);
            setUserslist(userslist.filter((u) => u.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setFormData({
                name: user.name,
                username: user.username,
                password: user.password,
                role:"User"
            });
        }
        setShowModal(true);
        }

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            name: "",
            username: "",
            password: "",
            role:""
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStore) return;

        setIsSubmitting(true);

        try {
            const userData = {
                name: formData.name,
                username: formData.username,
                password: formData.password,
                store_id: selectedStore?.id,
                role: "User",
            };

            const newUser = await apiClient.createWorker(userData);
            setUserslist([...userslist,newUser]);

            handleCloseModal();
        } catch (error) {
            console.error("Error saving user:", error);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="p-8">

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Trabajadores</h1>
                    <p className="text-muted-foreground mt-1">
                        Administra los trabajadores de {selectedStore?.name}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Trabajador
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                Nombre
                            </th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                Usuario
                            </th>

                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                Rol
                            </th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                Acciones
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {userslist.map((u) => (
                                <tr key={u.id}  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-foreground">{u.name}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-foreground font-medium">
                                        {u.username}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {u.role}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                                            </button>
                                            <button
                                                onClick={()=>handleDelete(u.id)}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                            )
                        )
                        }
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-foreground">
                            {"Nuevo Trabajador"}
                        </h3>
                        <button
                            onClick={handleCloseModal}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Nombre del Trabajador
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                placeholder="Nombre"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Usuario
                            </label>
                            <input
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                placeholder="Usuario"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Tienda
                                </label>
                                <input
                                    disabled
                                    type="number"
                                    value={selectedStore?.id}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                    placeholder="Tienda"
                                    readOnly={true}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Rol
                                </label>
                                <input
                                    type="text"
                                    value="User"
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                placeholder="Contraseña"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"

                                className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"

                                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Crear Trabajador"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>)}
        </div>
    );
};

