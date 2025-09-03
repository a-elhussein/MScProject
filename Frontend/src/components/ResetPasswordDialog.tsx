import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {useEffect, useState} from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ResetPasswordDialog({ open, onClose }: Props) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    }, [open]);

    const handleReset = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const res = await api.patch("/api/User/ResetPassword", {
                currentPassword,
                newPassword,
                confirmNewPassword: confirmPassword,
            });

            if (res.data.errorExist) throw new Error(res.data.errorMessage);
            toast.success("Password reset successfully");
            onClose();
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Reset failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Must be 8–64 characters</p>
                    <Input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {newPassword.length > 0 && (newPassword.length < 8 || newPassword.length > 64) && (
                        <p className="text-sm text-red-600">Password must be 8–64 characters long</p>
                    )}
                    <Input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {confirmPassword.length > 0 && (confirmPassword.length < 8 || confirmPassword.length > 64) && (
                        <p className="text-sm text-red-600">Password must be 8–64 characters long</p>
                    )}
                    <Button className="w-full" onClick={handleReset} disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}