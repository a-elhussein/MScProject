import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import type { Result } from "@zxing/library";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Props = {
    open: boolean;
    onClose: () => void;
    onDetected: (code: string) => void | Promise<void>;
    title?: string;
};

export default function BarcodeScannerDialog({ open, onClose, onDetected, title = "Scan barcode" }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const readerRef = useRef<BrowserMultiFormatReader | null>(null);
    const controlsRef = useRef<IScannerControls | null>(null);

    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const [starting, setStarting] = useState(false);

    function onDecode(result?: Result | null) {
        if (!result) return;
        const text = result.getText?.() ?? "";
        if (!text) return;
        stop();
        Promise.resolve(onDetected(text)).finally(() => onClose());
    }

    useEffect(() => {
        if (!open) { stop(); return; }
        let cancelled = false;

        async function prepare() {
            setErrMsg(null);
            setStarting(true);
            try {
                if (navigator.mediaDevices?.enumerateDevices) {
                    const all = await navigator.mediaDevices.enumerateDevices();
                    const vids = all.filter(d => d.kind === "videoinput");
                    setDevices(vids);
                    const preferred =
                        vids.find(d => /back|rear|environment/i.test(d.label)) ??
                        vids[vids.length - 1] ??
                        vids[0];
                    const id = preferred?.deviceId ?? null;
                    setSelectedDeviceId(id);
                    await start(id || undefined);
                } else {
                    await start();
                }
            } catch (e: unknown) {
                setErrMsg(e instanceof Error ? e.message : String(e));
            } finally {
                if (!cancelled) setStarting(false);
            }
        }

        prepare();
        return () => { cancelled = true; stop(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    async function start(deviceId?: string) {
        try {
            readerRef.current = new BrowserMultiFormatReader();
            if (!videoRef.current) return;

            if (deviceId) {
                controlsRef.current = await readerRef.current.decodeFromVideoDevice(
                    deviceId,
                    videoRef.current,
                    (result) => onDecode(result)
                );
            } else {
                const constraints: MediaStreamConstraints = {
                    audio: false,
                    video: {
                        facingMode: { ideal: "environment" },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                };
                controlsRef.current = await readerRef.current.decodeFromConstraints(
                    constraints,
                    videoRef.current,
                    (result) => onDecode(result)
                );
            }
        } catch (e: unknown) {
            setErrMsg(e instanceof Error ? e.message : "Failed to start camera");
            stop();
            throw e;
        }
    }

    async function switchTo(id: string) {
        setSelectedDeviceId(id);
        stop();
        try {
            await start(id);
        } catch (e) {
            setErrMsg(e instanceof Error ? e.message : "Failed to switch camera");
        }
    }

    function stop() {
        try { controlsRef.current?.stop(); } catch {/* ignore stop errors */ }
        const stream = videoRef.current?.srcObject as MediaStream | null;
        stream?.getTracks().forEach((t) => t.stop());
        controlsRef.current = null;
        readerRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2">
                    {devices.length > 1 && (
                        <div className="grid gap-1">
                            <Label htmlFor="camera">Camera</Label>
                            <Select value={selectedDeviceId ?? ""} onValueChange={(v) => switchTo(v)}>
                                <SelectTrigger id="camera">
                                    <SelectValue placeholder="Select camera" />
                                </SelectTrigger>
                                <SelectContent>
                                    {devices.map((d, i) => (
                                        <SelectItem key={d.deviceId || String(i)} value={d.deviceId}>
                                            {d.label || `Camera ${i + 1}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {errMsg && (
                        <p className="text-xs text-red-600">{errMsg}</p>
                    )}

                    {starting && !errMsg && (
                        <p className="text-xs text-muted-foreground">Starting camera…</p>
                    )}
                </div>
                <div className="rounded-md overflow-hidden border bg-black">
                    <video
                        ref={videoRef}
                        className="w-full h-[50vh] object-cover"
                        muted
                        playsInline
                        autoPlay
                    />
                </div>
                <DialogFooter className="mt-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}