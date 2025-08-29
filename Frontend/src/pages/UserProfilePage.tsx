import UserProfileEditor from "@/components/UserProfileEditor";
import {Button} from "@/components/ui/button.tsx";
import ResetPasswordDialog from "@/components/ResetPasswordDialog.tsx";
import {useState} from "react";

export default function UserProfilePage() {

    const [resetOpen, setResetOpen] = useState(false);

    return (
        <div className="max-w-xl mx-auto p-4 space-y-6">
            <Button variant="outline" className="ml-auto" onClick={() => setResetOpen(true)}>
                Reset Password
            </Button>
            <ResetPasswordDialog open={resetOpen} onClose={() => setResetOpen(false)} />
            <UserProfileEditor />
        </div>
    );
}