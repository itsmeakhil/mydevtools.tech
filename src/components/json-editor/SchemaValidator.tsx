"use client";

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

interface SchemaValidatorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    content: string;
}

export default function SchemaValidator({
    open,
    onOpenChange,
    content,
}: SchemaValidatorProps) {
    const [schema, setSchema] = useState('{\n  "type": "object"\n}');
    const [validationResult, setValidationResult] = useState<{
        valid: boolean;
        errors: any[] | null;
        message?: string;
    } | null>(null);

    const handleValidate = () => {
        if (!content) {
            setValidationResult({
                valid: false,
                errors: null,
                message: 'No JSON content to validate',
            });
            return;
        }

        if (!schema) {
            setValidationResult({
                valid: false,
                errors: null,
                message: 'No schema provided',
            });
            return;
        }

        try {
            // Parse JSON content
            const data = JSON.parse(content);

            // Parse schema
            const schemaObj = JSON.parse(schema);

            // Create AJV instance with formats
            const ajv = new Ajv({ allErrors: true });
            addFormats(ajv);

            // Compile and validate
            const validate = ajv.compile(schemaObj);
            const valid = validate(data);

            if (valid) {
                setValidationResult({
                    valid: true,
                    errors: null,
                    message: 'JSON is valid according to the schema!',
                });
            } else {
                setValidationResult({
                    valid: false,
                    errors: validate.errors || [],
                });
            }
        } catch (err) {
            setValidationResult({
                valid: false,
                errors: null,
                message: err instanceof Error ? err.message : 'Validation failed',
            });
        }
    };

    const handleClose = () => {
        setValidationResult(null);
        onOpenChange(false);
    };

    // Example schemas
    const exampleSchemas = [
        {
            label: 'Simple Object',
            schema: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' },
                },
                required: ['name'],
            },
        },
        {
            label: 'Array of Objects',
            schema: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        title: { type: 'string' },
                    },
                    required: ['id', 'title'],
                },
            },
        },
        {
            label: 'With Formats',
            schema: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    url: { type: 'string', format: 'uri' },
                    date: { type: 'string', format: 'date' },
                },
            },
        },
    ];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        JSON Schema Validation
                    </DialogTitle>
                    <DialogDescription>
                        Validate your JSON against a JSON Schema
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {/* Schema Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">JSON Schema</label>
                            <div className="flex gap-2">
                                {exampleSchemas.map(({ label, schema: exampleSchema }) => (
                                    <Button
                                        key={label}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => setSchema(JSON.stringify(exampleSchema, null, 2))}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <Textarea
                            value={schema}
                            onChange={(e) => setSchema(e.target.value)}
                            placeholder="Enter JSON Schema..."
                            className="font-mono text-xs min-h-[200px]"
                        />
                    </div>

                    {/* Validate Button */}
                    <Button onClick={handleValidate} className="w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Validate
                    </Button>

                    {/* Validation Result */}
                    {validationResult && (
                        <div className="space-y-2">
                            {validationResult.message ? (
                                <Alert
                                    variant={validationResult.valid ? 'default' : 'destructive'}
                                    className={
                                        validationResult.valid
                                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                                            : ''
                                    }
                                >
                                    {validationResult.valid ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4" />
                                    )}
                                    <AlertDescription
                                        className={
                                            validationResult.valid
                                                ? 'text-green-600 dark:text-green-400'
                                                : ''
                                        }
                                    >
                                        {validationResult.message}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-2">
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Validation failed with {validationResult.errors?.length || 0} error(s)
                                        </AlertDescription>
                                    </Alert>

                                    {/* Error Details */}
                                    {validationResult.errors && validationResult.errors.length > 0 && (
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-muted px-3 py-2 text-sm font-semibold border-b">
                                                Validation Errors
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {validationResult.errors.map((error, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 border-b last:border-b-0 hover:bg-muted/30"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    {error.instancePath || '/'}: {error.message}
                                                                </p>
                                                                {error.params && Object.keys(error.params).length > 0 && (
                                                                    <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                                                                        {JSON.stringify(error.params, null, 2)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Help Section */}
                    <div className="border rounded-lg p-3 bg-muted/10">
                        <p className="text-xs font-semibold mb-2">JSON Schema Types:</p>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                            <li><span className="text-primary font-mono">type</span>: string, number, integer, boolean, object, array, null</li>
                            <li><span className="text-primary font-mono">properties</span>: Object property definitions</li>
                            <li><span className="text-primary font-mono">required</span>: Array of required property names</li>
                            <li><span className="text-primary font-mono">format</span>: email, uri, date, time, date-time, etc.</li>
                            <li><span className="text-primary font-mono">minimum/maximum</span>: Number constraints</li>
                            <li><span className="text-primary font-mono">minLength/maxLength</span>: String length constraints</li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
