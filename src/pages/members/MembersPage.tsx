import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

// Placeholder component for the list of members
const MembersList = () => {
  const navigate = useNavigate();
  
  // Placeholder data
  const members = [
    { id: 1, name: "Alice Johnson", plan: "Monthly", status: "Active", expiration: "2024-11-15" },
    { id: 2, name: "Bob Smith", plan: "Yearly", status: "Active", expiration: "2025-08-01" },
    { id: 3, name: "Charlie Brown", plan: "Daily", status: "Expired", expiration: "2024-09-20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Member Management</h1>
        <Button onClick={() => navigate('register')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Register New Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search members by name or email..." />
          </div>
          <Separator className="mb-4" />
          
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.plan} Plan</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${member.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                    {member.status}
                  </span>
                  <p className="text-xs text-muted-foreground">Expires: {member.expiration}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


const MembersPage = () => {
  return (
    <div className="flex flex-col flex-1">
      <Routes>
        <Route index element={<MembersList />} />
        <Route path="register" element={<RegistrationForm />} />
      </Routes>
    </div>
  );
};

export default MembersPage;