import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import type { CheckResultsResponse, RuleCheckResponse } from './types/checkResults.type';

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [rules, setRules] = useState(['', '', '']);
  const [results, setResults] = useState<RuleCheckResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const handleCheckDocument = async () => {
    if (!pdfFile) {
      alert('Please upload a PDF file');
      return;
    }

    const validRules = rules.filter(rule => rule.trim() !== '');
    if (validRules.length === 0) {
      alert('Please enter at least one rule');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('rules', JSON.stringify(validRules));

    try {
      const response = await axios.post<CheckResultsResponse>(
        'http://localhost:3001/api/check-results/check',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setResults(response.data.results);
    } catch (error) {
      console.error('Error checking document:', error);
      alert('Error checking document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'pass') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Rule Checker</h1>
          <p className="text-gray-600">Upload a PDF and define rules to check against it</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF (2-10 pages)
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              {pdfFile && (
                <span className="text-sm text-green-600">
                  ✓ {pdfFile.name}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 3 Rules to Check
            </label>
            {rules.map((rule, index) => (
              <div key={index} className="mb-3">
                <Input
                  type="text"
                  placeholder={`Rule ${index + 1} (e.g., "The document must have a purpose section")`}
                  value={rule}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleCheckDocument}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Document...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Check Document
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Check Results</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Reasoning</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.rule}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className={`font-medium ${
                          result.status === 'pass' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">{result.evidence}</TableCell>
                    <TableCell className="max-w-md">{result.reasoning}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;