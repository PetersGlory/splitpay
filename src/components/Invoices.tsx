import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, FileText, Download, Share2, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrency } from '../App';
import { InvoiceAPI } from '../services/api';

interface InvoicesProps {
  onNavigate: (screen: string) => void;
}

export function Invoices({ onNavigate }: InvoicesProps) {
  const { currencySymbol } = useCurrency();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    description: '',
    amount: '',
    dueDate: ''
  });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await InvoiceAPI.getInvoices();
      
      if (response.success && response.data) {
        setInvoices(response.data.invoices);
      } else {
        setError(response.error?.message || 'Failed to load invoices');
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!formData.clientName || !formData.clientEmail || !formData.description || !formData.amount || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await InvoiceAPI.createInvoice({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        description: formData.description,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate
      });

      if (response.success && response.data) {
        setSuccess('Invoice created successfully!');
        setFormData({
          clientName: '',
          clientEmail: '',
          description: '',
          amount: '',
          dueDate: ''
        });
        setShowCreateForm(false);
        // Refresh invoices list
        await loadInvoices();
      } else {
        setError(response.error?.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Invoice creation error:', error);
      setError('Failed to create invoice. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showCreateForm) {
    return (
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center pt-4 pb-4">
          <button 
            onClick={() => setShowCreateForm(false)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Create Invoice</h1>
        </div>

        {/* Create Invoice Form */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the service or product"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      {currencySymbol}
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <Button 
            onClick={handleCreateInvoice}
            className="w-full h-12"
            disabled={!formData.clientName || !formData.clientEmail || !formData.description || !formData.amount || !formData.dueDate || creating}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Invoice'
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between pt-4 pb-4">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl">Invoices</h1>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading invoices...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-4">
        <div className="flex items-center">
          <button 
            onClick={() => onNavigate('home')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Invoices</h1>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Invoice List */}
      <div className="space-y-4">
        {invoices.length > 0 ? invoices.map((invoice) => (
          <Card key={invoice.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{invoice.id}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {invoice.clientName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.description}
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium text-lg">
                  {currencySymbol}{invoice.amount}
                </div>
                <div className="text-xs text-muted-foreground">
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </Card>
        )) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No invoices yet</p>
            <p className="text-sm">Create your first invoice to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}