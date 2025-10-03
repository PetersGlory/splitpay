import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, FileText, Download, Share2, Plus } from 'lucide-react';
import { useCurrency } from '../App';

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

  const invoices = [
    {
      id: 'INV-001',
      clientName: 'Acme Corp',
      description: 'Web Development Services',
      amount: '250,000',
      status: 'Paid',
      dueDate: '2024-01-15',
      createdDate: '2024-01-01'
    },
    {
      id: 'INV-002',
      clientName: 'Tech Solutions Ltd',
      description: 'Mobile App Design',
      amount: '180,000',
      status: 'Pending',
      dueDate: '2024-01-20',
      createdDate: '2024-01-05'
    },
    {
      id: 'INV-003',
      clientName: 'StartupXYZ',
      description: 'Consultation Services',
      amount: '75,000',
      status: 'Overdue',
      dueDate: '2024-01-10',
      createdDate: '2023-12-28'
    }
  ];

  const handleCreateInvoice = () => {
    // Mock invoice creation
    console.log('Creating invoice:', formData);
    setShowCreateForm(false);
    setFormData({
      clientName: '',
      clientEmail: '',
      description: '',
      amount: '',
      dueDate: ''
    });
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

          <Button 
            onClick={handleCreateInvoice}
            className="w-full h-12"
            disabled={!formData.clientName || !formData.amount}
          >
            Create Invoice
          </Button>
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

      {/* Invoice List */}
      <div className="space-y-4">
        {invoices.map((invoice) => (
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
        ))}
      </div>
    </div>
  );
}