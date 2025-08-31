// src/pages/AdminDashboard.tsx
import {useState} from 'react'
import {Switch} from '@/components/ui/switch'
import {Label} from '@/components/ui/label'
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from '@/components/ui/table'
import api from '@/lib/axios'
import {toast} from "sonner";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useQuery} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";

export default function AdminDashboardPage() {
    const [open, setOpen] = useState(false);
    const [adminForm, setAdminForm] = useState({
        username: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showResetDialog, setShowResetDialog] = useState(false);

    const handleLogout = () => {
      logout();
      navigate("/login");
    };

    const { data: users = [], isLoading: loading, refetch } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const res = await api.get("/api/User/All users");
            return res.data.data;
        },
    });

    const handleStatusToggle = async (userId: number, currentStatus: number) => {
        const newStatus = currentStatus === 0 ? 1 : 0
        try {
            await api.patch(`/api/User/${userId}/status`, { status: newStatus });
            toast.success('User status updated');
            await refetch();
        } catch {
            toast.error('Failed to update status')
        }
    }

    return (
        <Card className="mx-auto max-w-6xl mt-10 p-6">
            <CardHeader>
                <CardTitle>Admin Dashboard - Users</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="flex justify-end mb-4 gap-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default">Register New Admin</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Admin</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <Input
                                        placeholder="Username"
                                        value={adminForm.username}
                                        onChange={(e) =>
                                            setAdminForm((prev) => ({...prev, username: e.target.value}))
                                        }
                                    />
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        value={adminForm.email}
                                        onChange={(e) =>
                                            setAdminForm((prev) => ({...prev, email: e.target.value}))
                                        }
                                    />
                                    <Input
                                        placeholder="Password"
                                        type="password"
                                        value={adminForm.password}
                                        onChange={(e) =>
                                            setAdminForm((prev) => ({...prev, password: e.target.value}))
                                        }
                                    />
                                    <Button
                                        onClick={async () => {
                                            try {
                                                const res = await api.post("/api/User/registeradmin", adminForm);
                                                toast.success(res.data?.data ?? "Admin registered");
                                                setAdminForm({username: "", email: "", password: ""});
                                                setOpen(false);
                                                await refetch();
                                            } catch {
                                                toast.error("Registration failed");
                                            }
                                        }}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button variant="outline" onClick={() => setShowResetDialog(true)}>
                            Reset Password
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user: { userId: number; userName: string; email: string; isActive: number }) => (
                                <TableRow key={user.userId}>
                                    <TableCell className="text-left">{user.userName}</TableCell>
                                    <TableCell className="text-left">{user.email}</TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={user.isActive === 0}
                                                onCheckedChange={() =>
                                                    handleStatusToggle(user.userId, user.isActive)
                                                }
                                            />
                                            <Label>{user.isActive === 0 ? 'Active' : 'Inactive'}</Label>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <ResetPasswordDialog open={showResetDialog} onClose={() => setShowResetDialog(false)} />
        </Card>
    )
}