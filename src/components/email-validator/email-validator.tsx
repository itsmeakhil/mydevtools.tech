"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import {
    IconCheck,
    IconX,
    IconAlertCircle,
    IconLoader2,
    IconUpload,
    IconDownload,
    IconCircleCheck,
    IconCircleX
} from "@tabler/icons-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

interface EmailValidation {
    email: string;
    validations: {
        syntax: boolean;
        domain_exists: boolean;
        mx_records: boolean;
        mailbox_exists: boolean;
        is_disposable: boolean;
        is_role_based: boolean;
    };
    score: number;
    status: string;
}

interface BulkResult {
    email: string;
    status: string;
    score: number;
    validations: {
        syntax: boolean;
        domain_exists: boolean;
        mx_records: boolean;
        mailbox_exists: boolean;
        is_disposable: boolean;
        is_role_based: boolean;
    };
}

export function EmailValidator() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<EmailValidation | null>(null);
    const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [activeTab, setActiveTab] = useState("single");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Stats for Bulk Validation
    const bulkStats = {
        total: bulkResults.length,
        valid: bulkResults.filter(r => r.status === "VALID").length,
        risky: bulkResults.filter(r => r.status === "DISPOSABLE" || r.status === "CATCH_ALL").length,
        invalid: bulkResults.filter(r => r.status === "INVALID").length,
    };

    const handleValidate = async () => {
        if (!email) {
            toast({
                title: "Error",
                description: "Please enter an email address",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setResult(null);
        setActiveTab("single");

        try {
            const response = await fetch(
                `/api/validate-email?email=${encodeURIComponent(email)}`,
                { headers: { accept: "application/json" } }
            );

            if (!response.ok) throw new Error("Failed to validate email");

            const data = await response.json();
            setResult(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while validating the email",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                const emails = data
                    .map((row) => row.email || row.Email || row.EMAIL)
                    .filter((email) => email && typeof email === "string")
                    .slice(0, 1000);

                if (emails.length === 0) {
                    toast({
                        title: "No Emails Found",
                        description: "Please ensure your Excel has an 'email' column.",
                        variant: "destructive",
                    });
                    return;
                }

                setBulkLoading(true);
                setBulkResults([]);
                setActiveTab("bulk");
                setResult(null);
                setProgress(0);

                const batchSize = 100;
                const totalBatches = Math.ceil(emails.length / batchSize);
                let allResults: BulkResult[] = [];

                for (let i = 0; i < totalBatches; i++) {
                    const batch = emails.slice(i * batchSize, (i + 1) * batchSize);
                    const response = await fetch("/api/validate-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ emails: batch }),
                    });

                    if (!response.ok) throw new Error(`Failed to validate batch ${i + 1}`);

                    const data = await response.json();
                    allResults = [...allResults, ...data.results];
                    setBulkResults([...allResults]);
                    setProgress(Math.round(((i + 1) / totalBatches) * 100));
                }

                toast({
                    title: "Success",
                    description: `Validated ${emails.length} emails successfully.`,
                });
            } catch (error) {
                console.error("Bulk validation error:", error);
                toast({
                    title: "Batch Validation Failed",
                    description: "An error occurred while processing bulk validation.",
                    variant: "destructive",
                });
            } finally {
                setBulkLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsBinaryString(file);
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            bulkResults.map((r) => ({
                Email: r.email,
                Status: r.status,
                Score: r.score,
                Syntax: r.validations.syntax ? "Valid" : "Invalid",
                Domain: r.validations.domain_exists ? "Yes" : "No",
                MX: r.validations.mx_records ? "Yes" : "No",
                Mailbox: r.validations.mailbox_exists ? "Yes" : "No",
                Disposable: r.validations.is_disposable ? "Yes" : "No",
                RoleBased: r.validations.is_role_based ? "Yes" : "No",
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        XLSX.writeFile(wb, "email_validation_results.xlsx");
    };

    const downloadTemplate = () => {
        const data = [{ email: "john.doe@example.com" }, { email: "support@mydevtools.tech" }];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "email_validation_template.xlsx");
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "VALID": return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20";
            case "DISPOSABLE": return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
            case "INVALID": return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20";
            default: return "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20";
        }
    };

    const ValidationItem = ({ label, value, isWarning = false, warningCondition = false }: any) => {
        const isActuallyWarning = isWarning && warningCondition;
        return (
            <div className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${isActuallyWarning
                ? "bg-yellow-500/5 border-yellow-500/30 text-yellow-700 dark:text-yellow-400"
                : "bg-card border-border/50 hover:border-border"
                }`}>
                <span className="text-sm font-medium opacity-90">{label}</span>
                {value ? (
                    <IconCircleCheck className={`h-5 w-5 ${isActuallyWarning ? "text-yellow-500" : "text-green-500"}`} stroke={2} />
                ) : (
                    <IconCircleX className="h-5 w-5 text-red-500" stroke={2} />
                )}
            </div>
        );
    };

    return (
        <ToolWrapper toolId="email-validator" maxWidth="5xl">
            <ToolHeader
                title="Email Validator"
                description="Verify and validate email addresses for syntax, domain, and deliverability."
                toolId="email-validator"
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <div className="flex justify-center">
                    <TabsList className="grid w-full max-w-md grid-cols-2 p-1">
                        <TabsTrigger value="single">Single Verification</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="single" className="space-y-6 focus-visible:outline-none">
                    <Card className="border-border/40 bg-background/50 backdrop-blur-sm shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-center">Single Email Verification</CardTitle>
                            <CardDescription className="text-center">Enter an email address to check its deliverability and reputation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3 max-w-xl mx-auto">
                                <Input
                                    placeholder="Enter email address..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                                    className="h-11"
                                />
                                <Button onClick={handleValidate} disabled={loading} className="h-11 px-6">
                                    {loading ? <IconLoader2 className="h-4 w-4 animate-spin mr-2" /> : <IconCheck className="h-4 w-4 mr-2" />}
                                    {loading ? "Validating..." : "Validate"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {result.validations.is_disposable && (
                                <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                                    <IconAlertCircle className="h-5 w-5 !text-yellow-600 dark:!text-yellow-400" />
                                    <AlertTitle className="font-semibold flex items-center gap-2 text-base">
                                        Disposable Email Detected
                                    </AlertTitle>
                                    <AlertDescription className="opacity-90">
                                        This email address belongs to a disposable email provider. It may be temporary or unsafe.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="grid gap-6 md:grid-cols-12">
                                <Card className="col-span-12 md:col-span-4 border-border/40 bg-background/50 backdrop-blur-sm h-full shadow-sm flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-base font-medium text-center text-muted-foreground">Reliability Score</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center flex-1 pb-8">
                                        <div className="relative flex items-center justify-center">
                                            {/* Simple SVG Circular Progress */}
                                            <svg className="h-40 w-40 transform -rotate-90">
                                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted/20" />
                                                <circle
                                                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent"
                                                    strokeDasharray={440}
                                                    strokeDashoffset={440 - (440 * result.score) / 100}
                                                    className={`transition-all duration-1000 ease-out ${result.score > 80 ? 'text-green-500' : result.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-bold tracking-tighter">{result.score}</span>
                                                <span className="text-xs font-semibold text-muted-foreground uppercase">Score</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex flex-col items-center gap-2">
                                            <Badge variant="outline" className={`px-4 py-1 text-sm font-medium ${getStatusColor(result.status)}`}>
                                                {result.status}
                                            </Badge>
                                            <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">{result.email}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="col-span-12 md:col-span-8 border-border/40 bg-background/50 backdrop-blur-sm shadow-sm h-full">
                                    <CardHeader>
                                        <CardTitle className="text-base font-medium">Validation Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <ValidationItem label="Syntax Valid" value={result.validations.syntax} />
                                            <ValidationItem label="Domain Exists" value={result.validations.domain_exists} />
                                            <ValidationItem label="MX Records Found" value={result.validations.mx_records} />
                                            <ValidationItem label="Mailbox Exists" value={result.validations.mailbox_exists} />
                                            <ValidationItem label="Disposable Email" value={result.validations.is_disposable} isWarning warningCondition={result.validations.is_disposable} />
                                            <ValidationItem label="Role Based Email" value={result.validations.is_role_based} isWarning warningCondition={result.validations.is_role_based} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </TabsContent>

                <TabsContent value="bulk" className="space-y-6 focus-visible:outline-none">
                    {!bulkLoading && bulkResults.length === 0 && (
                        <Card className="border-dashed border-2 bg-muted/20 hover:bg-muted/40 transition-colors">
                            <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center cursor-pointer"
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                            >
                                <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                                    <IconUpload className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Drag and drop your Excel file here</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                                    Upload a .xlsx file containing an 'email' column to validate up to 1000 emails at once.
                                </p>
                                <div className="flex gap-3">
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls" className="hidden" />
                                    <Button onClick={() => fileInputRef.current?.click()}>
                                        Select File
                                    </Button>
                                    <Button variant="outline" onClick={downloadTemplate}>
                                        <IconDownload className="mr-2 h-4 w-4" /> Download Template
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {bulkLoading && (
                        <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-8 text-center">
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                                        <IconLoader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Validating Emails...</h3>
                                    <p className="text-muted-foreground text-sm">Processing batch {Math.ceil(progress / 100 * (1000 / 100))}...</p>
                                </div>
                                <Progress value={progress} className="h-2 w-full" />
                            </div>
                        </Card>
                    )}

                    {bulkResults.length > 0 && !bulkLoading && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card className="bg-background/50 border-border/40 p-4 flex flex-col justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Total Processed</span>
                                    <span className="text-2xl font-bold">{bulkStats.total}</span>
                                </Card>
                                <Card className="bg-green-500/10 border-green-500/20 p-4 flex flex-col justify-between">
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Valid</span>
                                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">{bulkStats.valid}</span>
                                </Card>
                                <Card className="bg-yellow-500/10 border-yellow-500/20 p-4 flex flex-col justify-between">
                                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Risky</span>
                                    <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{bulkStats.risky}</span>
                                </Card>
                                <Card className="bg-red-500/10 border-red-500/20 p-4 flex flex-col justify-between">
                                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Invalid</span>
                                    <span className="text-2xl font-bold text-red-700 dark:text-red-300">{bulkStats.invalid}</span>
                                </Card>
                            </div>

                            <Card className="border-border/40 bg-background/50 backdrop-blur-sm overflow-hidden">
                                <div className="p-4 border-b border-border/40 flex justify-between items-center bg-muted/20">
                                    <h3 className="font-medium">Detailed Results</h3>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setBulkResults([]);
                                            setActiveTab("single");
                                        }}>
                                            New Verification
                                        </Button>
                                        <Button size="sm" onClick={exportToExcel}>
                                            <IconDownload className="mr-2 h-4 w-4" /> Export Report
                                        </Button>
                                    </div>
                                </div>
                                <div className="max-h-[500px] overflow-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background z-10">
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-center">Score</TableHead>
                                                <TableHead className="text-center">Checks</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bulkResults.map((r, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-medium">{r.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`capitalize ${getStatusColor(r.status)}`}>
                                                            {r.status.toLowerCase().replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`font-mono font-bold ${r.score > 80 ? "text-green-500" : r.score > 50 ? "text-yellow-500" : "text-red-500"}`}>
                                                            {r.score}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <div title="Syntax" className={`h-2 w-2 rounded-full ${r.validations.syntax ? "bg-green-500" : "bg-red-500"}`} />
                                                            <div title="Domain" className={`h-2 w-2 rounded-full ${r.validations.domain_exists ? "bg-green-500" : "bg-red-500"}`} />
                                                            <div title="MX" className={`h-2 w-2 rounded-full ${r.validations.mx_records ? "bg-green-500" : "bg-red-500"}`} />
                                                            <div title="Mailbox" className={`h-2 w-2 rounded-full ${r.validations.mailbox_exists ? "bg-green-500" : "bg-red-500"}`} />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </ToolWrapper>
    );
}
