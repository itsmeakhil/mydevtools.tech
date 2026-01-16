"use client";

import { useState, useRef, useMemo } from "react";
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
    IconCircleX,
    IconCopy,
    IconSearch
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { copyToClipboard, isCopied } = useCopyToClipboard();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = useMemo(() => {
        if (!email) return null;
        return emailRegex.test(email);
    }, [email]);

    // Stats for Bulk Validation
    const bulkStats = {
        total: bulkResults.length,
        valid: bulkResults.filter(r => r.status === "VALID").length,
        risky: bulkResults.filter(r => r.status === "DISPOSABLE" || r.status === "CATCH_ALL").length,
        invalid: bulkResults.filter(r => r.status === "INVALID").length,
    };

    // Filter bulk results based on search query
    const filteredBulkResults = useMemo(() => {
        if (!searchQuery) return bulkResults;
        const query = searchQuery.toLowerCase();
        return bulkResults.filter(r =>
            r.email.toLowerCase().includes(query) ||
            r.status.toLowerCase().includes(query)
        );
    }, [bulkResults, searchQuery]);

    const handleClear = () => {
        setEmail("");
        setResult(null);
        setSearchQuery("");
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

        if (!isValidFormat) {
            toast({
                title: "Invalid Email Format",
                description: "Please enter a valid email address",
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
        setUploadedFileName(file.name);
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
                    setUploadedFileName(null);
                    return;
                }

                setBulkLoading(true);
                setBulkResults([]);
                setActiveTab("bulk");
                setResult(null);
                setProgress(0);
                setSearchQuery("");

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
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const exportToExcel = (validOnly: boolean = false) => {
        const dataToExport = validOnly
            ? bulkResults.filter(r => r.status === "VALID")
            : bulkResults;

        if (dataToExport.length === 0) {
            toast({
                title: "No Data to Export",
                description: validOnly ? "No valid emails found to export." : "No results to export.",
                variant: "destructive",
            });
            return;
        }

        const ws = XLSX.utils.json_to_sheet(
            dataToExport.map((r) => ({
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
        XLSX.writeFile(wb, validOnly ? "valid_emails.xlsx" : "email_validation_results.xlsx");

        toast({
            title: "Export Successful",
            description: `Exported ${dataToExport.length} ${validOnly ? "valid " : ""}email(s).`,
        });
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

    const ValidationItem = ({ label, value, isWarning = false, warningCondition = false, tooltip }: any) => {
        const isActuallyWarning = isWarning && warningCondition;
        const content = (
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

        if (tooltip) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {content}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                            <p className="text-xs">{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return content;
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
                                <div className="relative flex-1">
                                    <Input
                                        type="email"
                                        placeholder="Enter email address..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                                        className={`h-11 pr-10 ${isValidFormat === false ? "border-red-500 focus-visible:ring-red-500" : isValidFormat === true ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                                        autoFocus
                                    />
                                    {email && (
                                        <button
                                            onClick={handleClear}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
                                            aria-label="Clear email"
                                        >
                                            <IconX className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>
                                <Button onClick={handleValidate} disabled={loading || !email || isValidFormat === false} className="h-11 px-6">
                                    {loading ? <IconLoader2 className="h-4 w-4 animate-spin mr-2" /> : <IconCheck className="h-4 w-4 mr-2" />}
                                    {loading ? "Validating..." : "Validate"}
                                </Button>
                            </div>
                            {isValidFormat === false && (
                                <p className="text-sm text-red-500 mt-2 text-center">Please enter a valid email address</p>
                            )}
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
                                            <div className="flex items-center gap-2 group">
                                                <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">{result.email}</span>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => copyToClipboard(result.email, "Email copied!")}
                                                            >
                                                                <IconCopy className={`h-3.5 w-3.5 ${isCopied ? "text-green-500" : ""}`} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Copy email</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="col-span-12 md:col-span-8 border-border/40 bg-background/50 backdrop-blur-sm shadow-sm h-full">
                                    <CardHeader>
                                        <CardTitle className="text-base font-medium">Validation Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <ValidationItem
                                                label="Syntax Valid"
                                                value={result.validations.syntax}
                                                tooltip="Checks if the email address follows the correct format (e.g., user@domain.com)"
                                            />
                                            <ValidationItem
                                                label="Domain Exists"
                                                value={result.validations.domain_exists}
                                                tooltip="Verifies that the domain name in the email address actually exists"
                                            />
                                            <ValidationItem
                                                label="MX Records Found"
                                                value={result.validations.mx_records}
                                                tooltip="Checks if the domain has mail exchange (MX) records configured to receive emails"
                                            />
                                            <ValidationItem
                                                label="Mailbox Exists"
                                                value={result.validations.mailbox_exists}
                                                tooltip="Verifies that the specific mailbox/account exists on the mail server"
                                            />
                                            <ValidationItem
                                                label="Disposable Email"
                                                value={result.validations.is_disposable}
                                                isWarning
                                                warningCondition={result.validations.is_disposable}
                                                tooltip="Indicates if this email belongs to a temporary/disposable email service (may be risky)"
                                            />
                                            <ValidationItem
                                                label="Role Based Email"
                                                value={result.validations.is_role_based}
                                                isWarning
                                                warningCondition={result.validations.is_role_based}
                                                tooltip="Identifies if this is a role-based email (e.g., support@, info@) rather than a personal address"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </TabsContent>

                <TabsContent value="bulk" className="space-y-6 focus-visible:outline-none">
                    {!bulkLoading && bulkResults.length === 0 && (
                        <Card className={`border-dashed border-2 transition-all ${dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "bg-muted/20 hover:bg-muted/40"}`}>
                            <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center cursor-pointer"
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                                onDragLeave={onDragLeave}
                            >
                                <div className={`bg-background p-4 rounded-full shadow-sm mb-4 transition-transform ${dragActive ? "scale-110" : ""}`}>
                                    <IconUpload className={`h-8 w-8 text-primary transition-transform ${dragActive ? "animate-bounce" : ""}`} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {dragActive ? "Drop your file here" : "Drag and drop your Excel file here"}
                                </h3>
                                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                                    Upload a .xlsx file containing an 'email' column to validate up to 1000 emails at once.
                                </p>
                                {uploadedFileName && (
                                    <div className="mb-4 px-4 py-2 bg-muted rounded-md text-sm">
                                        <span className="text-muted-foreground">File: </span>
                                        <span className="font-medium">{uploadedFileName}</span>
                                    </div>
                                )}
                                <div className="flex gap-3 flex-wrap justify-center">
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
                                <div className="p-4 border-b border-border/40 bg-muted/20">
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <h3 className="font-medium">Detailed Results</h3>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:flex-initial sm:w-64">
                                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search emails..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9 h-9"
                                                />
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => {
                                                setBulkResults([]);
                                                setSearchQuery("");
                                                setUploadedFileName(null);
                                                setActiveTab("single");
                                            }}>
                                                New Verification
                                            </Button>
                                            <Button size="sm" onClick={() => exportToExcel(false)}>
                                                <IconDownload className="mr-2 h-4 w-4" /> Export All
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => exportToExcel(true)} disabled={bulkStats.valid === 0}>
                                                <IconCircleCheck className="mr-2 h-4 w-4 text-green-500" /> Export Valid Only ({bulkStats.valid})
                                            </Button>
                                        </div>
                                    </div>
                                    {searchQuery && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Showing {filteredBulkResults.length} of {bulkResults.length} results
                                        </p>
                                    )}
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
                                            {filteredBulkResults.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        No results found matching "{searchQuery}"
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredBulkResults.map((r, i) => (
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
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="flex justify-center gap-1.5 cursor-help">
                                                                            <div className={`h-2 w-2 rounded-full ${r.validations.syntax ? "bg-green-500" : "bg-red-500"}`} />
                                                                            <div className={`h-2 w-2 rounded-full ${r.validations.domain_exists ? "bg-green-500" : "bg-red-500"}`} />
                                                                            <div className={`h-2 w-2 rounded-full ${r.validations.mx_records ? "bg-green-500" : "bg-red-500"}`} />
                                                                            <div className={`h-2 w-2 rounded-full ${r.validations.mailbox_exists ? "bg-green-500" : "bg-red-500"}`} />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <div className="text-xs space-y-1">
                                                                            <div>Syntax: {r.validations.syntax ? "✓" : "✗"}</div>
                                                                            <div>Domain: {r.validations.domain_exists ? "✓" : "✗"}</div>
                                                                            <div>MX: {r.validations.mx_records ? "✓" : "✗"}</div>
                                                                            <div>Mailbox: {r.validations.mailbox_exists ? "✓" : "✗"}</div>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
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
