"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Download, Image as ImageIcon, X, RefreshCw } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function ImageConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
    const [quality, setQuality] = useState(0.8);
    const [isConverting, setIsConverting] = useState(false);
    const [convertedImage, setConvertedImage] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
            setConvertedImage(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".webp"],
        },
        maxFiles: 1,
    });

    const handleConvert = async () => {
        if (!file || !preview) return;

        setIsConverting(true);
        try {
            const img = new Image();
            img.src = preview;
            await new Promise((resolve) => (img.onload = resolve));

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Could not get canvas context");

            ctx.drawImage(img, 0, 0);

            const dataUrl = canvas.toDataURL(`image/${format}`, quality);
            setConvertedImage(dataUrl);
            toast.success("Image converted successfully!");
        } catch (error) {
            console.error("Conversion error:", error);
            toast.error("Failed to convert image.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (!convertedImage) return;
        const link = document.createElement("a");
        link.href = convertedImage;
        link.download = `converted-image.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setConvertedImage(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Image Converter</h1>
                <p className="text-muted-foreground">
                    Convert images between different formats easily.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Image</CardTitle>
                        <CardDescription>
                            Drag and drop or click to upload an image.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!file ? (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Upload className="h-8 w-8 text-primary" />
                                </div>
                                <p className="text-lg font-medium mb-1">
                                    {isDragActive ? "Drop image here" : "Upload Image"}
                                </p>
                                <p className="text-sm text-muted-foreground text-center">
                                    Supports PNG, JPG, WEBP
                                </p>
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border bg-muted/50">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 z-10 h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearFile();
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                {preview && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-64 object-contain"
                                    />
                                )}
                                <div className="p-3 border-t bg-background/80 backdrop-blur-sm">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Options</CardTitle>
                        <CardDescription>
                            Select format and quality for conversion.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Target Format</Label>
                            <Select
                                value={format}
                                onValueChange={(value: "png" | "jpeg" | "webp") =>
                                    setFormat(value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="png">PNG</SelectItem>
                                    <SelectItem value="jpeg">JPEG</SelectItem>
                                    <SelectItem value="webp">WEBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {format !== "png" && (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Quality</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(quality * 100)}%
                                    </span>
                                </div>
                                <Input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    value={quality}
                                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                                    className="cursor-pointer"
                                />
                            </div>
                        )}

                        <Button
                            className="w-full"
                            size="lg"
                            disabled={!file || isConverting}
                            onClick={handleConvert}
                        >
                            {isConverting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Converting...
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Convert Image
                                </>
                            )}
                        </Button>

                        {convertedImage && (
                            <div className="pt-4 border-t animate-in fade-in slide-in-from-top-4">
                                <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border/50 text-center">
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                                        Conversion Complete!
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Ready for download
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full border-primary/20 hover:bg-primary/5 text-primary"
                                    onClick={handleDownload}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Converted Image
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
