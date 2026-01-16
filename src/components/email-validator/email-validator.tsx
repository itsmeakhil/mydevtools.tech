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
    const [isBulkMode, setIsBulkMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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
        setIsBulkMode(false);

        try {
            const response = await fetch(
                `/api/validate-email?email=${encodeURIComponent(email)}`,
                {
                    headers: {
                        accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to validate email");
            }

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
                setIsBulkMode(true);
                setResult(null);
                setProgress(0);

                const batchSize = 100;
                const totalBatches = Math.ceil(emails.length / batchSize);
                let allResults: BulkResult[] = [];

                for (let i = 0; i < totalBatches; i++) {
                    const batch = emails.slice(i * batchSize, (i + 1) * batchSize);

                    const response = await fetch("/api/validate-email", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ emails: batch }),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to validate batch ${i + 1}`);
                    }

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
        const data = [
            { email: "john.doe@example.com" },
            { email: "support@mydevtools.tech" },
            { email: "contact@company.com" },
        ];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "email_validation_template.xlsx");
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "VALID":
                return "bg-green-500/10 text-green-500 border-green-500/20";
            case "DISPOSABLE":
                return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "INVALID":
                return "bg-red-500/10 text-red-500 border-red-500/20";
            default:
                return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        }
    };

    const ValidationItem = ({
        label,
        value,
        isWarning = false,
        warningCondition = false
    }: {
        label: string;
        value: boolean;
        isWarning?: boolean;
        warningCondition?: boolean;
    }) => {
        const isActuallyWarning = isWarning && warningCondition;

        return (
            <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isActuallyWarning
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                : "bg-accent/50 border-border/50"
                }`}>
                <span className="text-sm font-medium">{label}</span>
                {value ? (
                    <IconCheck className={`h-5 w-5 ${isActuallyWarning ? "text-yellow-500" : "text-green-500"}`} stroke={2.5} />
                ) : (
                    <IconX className="h-5 w-5 text-red-500" stroke={2.5} />
                )}
            </div>
        );
    };

    return (
        <ToolWrapper toolId="email-validator" maxWidth="5xl">
            <ToolHeader
                title="Email Validator"
                description="Verify and validate email addresses for syntax, domain, and more."
                toolId="email-validator"
            />

            <div className="grid gap-6">
                <Card className="border-border/40 bg-background/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Validation Method</CardTitle>
                        <CardDescription>Enter single email or upload an Excel file for bulk validation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex gap-2 flex-1 w-full max-w-md">
                                <Input
                                    placeholder="example@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                                />
                                <Button onClick={handleValidate} disabled={loading || bulkLoading}>
                                    {loading ? (
                                        <IconLoader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Validate"
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="h-8 w-[1px] bg-border mx-2 hidden md:block" />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading || bulkLoading}
                                >
                                    <IconUpload className="mr-2 h-4 w-4" />
                                    Bulk Validation (.xlsx)
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={downloadTemplate}
                                    className="text-xs text-muted-foreground hover:text-primary"
                                >
                                    <IconDownload className="mr-1 h-3.5 w-3.5" />
                                    Download Sample
                                </Button>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-3 px-1">
                            Supported formats: Excel (.xlsx, .xls), limit 1000 emails per session.
                        </p>
                    </CardContent>
                </Card>

                {bulkLoading && (
                    <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span>Processing Batch Validation...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-center">
                                Processing batches of 100 emails. Please don't close this tab.
                            </p>
                        </div>
                    </Card>
                )}

                {isBulkMode && bulkResults.length > 0 && (
                    <Card className="border-border/40 bg-background/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-accent/5 px-6">
                            <div>
                                <CardTitle className="text-lg">Bulk Results</CardTitle>
                                <CardDescription>Detected {bulkResults.length} validated emails.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={exportToExcel}>
                                <IconDownload className="mr-2 h-4 w-4" />
                                Export results
                            </Button>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-accent/5 hover:bg-accent/5">
                                        <TableHead className="w-[300px]">Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Score</TableHead>
                                        <TableHead className="text-center">Syntax</TableHead>
                                        <TableHead className="text-center">Domain</TableHead>
                                        <TableHead className="text-center">MX</TableHead>
                                        <TableHead className="text-center">Mailbox</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bulkResults.map((r, i) => (
                                        <TableRow key={i} className="hover:bg-accent/10 transition-colors">
                                            <TableCell className="font-medium truncate max-w-[300px]">
                                                {r.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`capitalize ${getStatusColor(r.status)}`}>
                                                    {r.status.toLowerCase().replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`font-bold ${r.score > 80 ? "text-green-500" : r.score > 50 ? "text-yellow-500" : "text-red-500"
                                                    }`}>
                                                    {r.score}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {r.validations.syntax ? <IconCircleCheck className="h-4 w-4 text-green-500 inline" /> : <IconCircleX className="h-4 w-4 text-red-500 inline" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {r.validations.domain_exists ? <IconCircleCheck className="h-4 w-4 text-green-500 inline" /> : <IconCircleX className="h-4 w-4 text-red-500 inline" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {r.validations.mx_records ? <IconCircleCheck className="h-4 w-4 text-green-500 inline" /> : <IconCircleX className="h-4 w-4 text-red-500 inline" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {r.validations.mailbox_exists ? <IconCircleCheck className="h-4 w-4 text-green-500 inline" /> : <IconCircleX className="h-4 w-4 text-red-500 inline" />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}

                {!isBulkMode && result && (
                    <div className="space-y-6">
                        {result.validations.is_disposable && (
                            <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                                <IconAlertCircle className="h-5 w-5 !text-yellow-500" />
                                <AlertTitle className="font-bold flex items-center gap-2">
                                    Disposable Email Detected
                                </AlertTitle>
                                <AlertDescription className="text-yellow-700/80 dark:text-yellow-400/80">
                                    This email address belongs to a disposable email provider. Emails sent to this address may never be read or could be visible to others.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="border-border/40 bg-background/50 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Result Summary</CardTitle>
                                        <Badge variant="outline" className={getStatusColor(result.status)}>
                                            {result.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-accent/20 border border-border/40">
                                        <div className="text-5xl font-bold tracking-tight mb-2">{result.score}%</div>
                                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                                            Reliability Score
                                        </div>
                                        <div className="w-full h-2 bg-accent/30 rounded-full mt-4 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ease-out ${result.score > 80 ? "bg-green-500" : result.score > 50 ? "bg-yellow-500" : "bg-red-500"
                                                    }`}
                                                style={{ width: `${result.score}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-muted-foreground">Checked Email</div>
                                        <div className="text-base font-semibold truncate">{result.email}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/40 bg-background/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Validation Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2">
                                        <ValidationItem label="Syntax Valid" value={result.validations.syntax} />
                                        <ValidationItem label="Domain Exists" value={result.validations.domain_exists} />
                                        <ValidationItem label="MX Records Found" value={result.validations.mx_records} />
                                        <ValidationItem label="Mailbox Exists" value={result.validations.mailbox_exists} />
                                        <ValidationItem
                                            label="Disposable Email"
                                            value={result.validations.is_disposable}
                                            isWarning
                                            warningCondition={result.validations.is_disposable}
                                        />
                                        <ValidationItem
                                            label="Role Based Email"
                                            value={result.validations.is_role_based}
                                            isWarning
                                            warningCondition={result.validations.is_role_based}
                                        />
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 px-1 font-medium leading-normal">
                                            <IconCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" stroke={3} />
                                            Green check indicates a positive validation (e.g., Domain Exists: Yes).
                                        </p>
                                        <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 px-1 font-medium leading-normal">
                                            <IconCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-500" stroke={3} />
                                            Yellow check indicates a flag to be aware of (e.g., Is Disposable: Yes).
                                        </p>
                                        <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 px-1 font-medium leading-normal">
                                            <IconX className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-500" stroke={3} />
                                            Red X indicates a failed validation (e.g., Mailbox Exists: No).
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </ToolWrapper>
    );
}
