"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { IconMailCheck, IconCheck, IconX, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import { useToast } from "@/components/ui/use-toast";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

export function EmailValidator() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<EmailValidation | null>(null);
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
        <ToolWrapper toolId="email-validator">
            <ToolHeader
                title="Email Validator"
                description="Verify and validate email addresses for syntax, domain, and more."
                toolId="email-validator"
            />

            <div className="grid gap-6">
                <Card className="border-border/40 bg-background/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Email Address</CardTitle>
                        <CardDescription>Enter the email address you want to verify.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="example@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                                className="max-w-md"
                            />
                            <Button onClick={handleValidate} disabled={loading}>
                                {loading ? (
                                    <>
                                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    "Validate"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
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
