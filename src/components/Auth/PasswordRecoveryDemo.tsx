import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { getDemoEmailLog, clearDemoEmailLog } from '../../lib/supabase';
import { getResetTokenStats } from '../../utils/passwordRecovery';

// This component is only for development/testing purposes
export default function PasswordRecoveryDemo() {
  const [emails, setEmails] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState('');

  const refreshData = () => {
    setEmails(getDemoEmailLog());
    setStats(getResetTokenStats());
  };

  const clearLogs = () => {
    clearDemoEmailLog();
    refreshData();
  };

  const copyResetLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(link);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const openResetLink = (link: string) => {
    // Extract just the hash part for local testing
    const hashPart = link.split('#')[1] || '';
    window.location.hash = hashPart;
    // Reload to trigger the reset password form
    window.location.reload();
  };

  React.useEffect(() => {
    refreshData();
    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Password Recovery Demo Dashboard
            </CardTitle>
            <CardDescription>
              This panel shows simulated email logs and recovery tokens for testing purposes.
              In production, emails would be sent via a real email service.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button onClick={refreshData}>Refresh Data</Button>
              <Button onClick={clearLogs} variant="outline">Clear Logs</Button>
            </div>

            {stats && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.expired}</div>
                  <div className="text-sm text-gray-600">Expired</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.used}</div>
                  <div className="text-sm text-gray-600">Used</div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Email Activity</h3>
              {emails.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No emails sent yet. Try the "Forgot Password?" flow to see email logs here.
                  </AlertDescription>
                </Alert>
              ) : (
                emails
                  .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                  .map((email, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4" />
                              <span className="font-semibold">{email.to}</span>
                              <Badge variant={email.type === 'password-reset' ? 'default' : 'secondary'}>
                                {email.type}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Subject:</strong> {email.subject}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {new Date(email.sentAt).toLocaleString()}
                            </div>
                            
                            {email.resetLink && (
                              <div className="mt-3 p-3 bg-gray-50 rounded border">
                                <div className="text-sm font-medium mb-2">Reset Link:</div>
                                <div className="flex items-center gap-2">
                                  <code className="text-xs bg-white px-2 py-1 rounded border flex-1 overflow-hidden">
                                    {email.resetLink}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyResetLink(email.resetLink)}
                                    className="flex items-center gap-1"
                                  >
                                    <Copy className="h-3 w-3" />
                                    {copied === email.resetLink ? 'Copied!' : 'Copy'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => openResetLink(email.resetLink)}
                                    className="flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Test
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Testing Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Go to the login page and click "Forgot your password?"</li>
                <li>2. Enter an email address of an existing user (e.g., sarah.johnson@email.com)</li>
                <li>3. Check this dashboard for the simulated email with reset link</li>
                <li>4. Click "Test" button next to the reset link to test the password reset flow</li>
                <li>5. Complete the password reset and verify you can login with the new password</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Available Test Users:</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <div><strong>Pet Owners:</strong> sarah.johnson@email.com, michael.chen@email.com, emma.rodriguez@email.com (password: password123)</div>
                <div><strong>Veterinarians:</strong> dr.martinez@petcare.com, dr.thompson@petcare.com (password: vetpass123)</div>
                <div><strong>Administrator:</strong> admin@petcare.com (password: adminpass123)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
