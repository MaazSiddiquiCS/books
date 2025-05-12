import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface AdminData {
  id: string;
  name: string;
  role: string;
  logged_in: string;
}

interface BookForm {
  book_id: string;
  published_date: string;
  language: string;
  id: string;
  title: string;
  author_id: string;
  genre_id: string;
  publisher_id: string;
  link: string;
  link_id: string;
  type_id: string;
}

const BookFormFields = ({ form, onChange }: { form: BookForm; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="grid grid-cols-2 gap-4">
    {Object.entries(form).map(([key, value]) => (
      <div key={key}>
        <Label htmlFor={key}>{key.replace(/_/g, ' ')}</Label>
        <Input
          type="text"
          id={key}
          name={key}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${key.replace(/_/g, ' ')}`}
        />
      </div>
    ))}
  </div>
);

export default function AdminDashboard({
  registerForm,
  handleRegisterChange,
  handleRegister,
  loginId,
  setLoginId,
  handleLogin,
  bookForm,
  handleBookFormChange,
  handleAddBook,
  isLoggedIn,
  handleLogout,
  error,
  loading,
  adminName
}: any) {
  return (
    <div className="p-4 space-y-6">
      {!isLoggedIn ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-bold">Admin Register</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input name="name" value={registerForm.name} onChange={handleRegisterChange} placeholder="Admin Name" />
              </div>
              <div>
                <Label htmlFor="id">Generated ID</Label>
                <Input name="id" value={registerForm.id} readOnly />
              </div>
            </div>
            <Button onClick={handleRegister} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h2 className="text-2xl font-bold">Welcome, {adminName}</h2>
          <Button onClick={handleLogout} variant="destructive">Logout</Button>
        </div>
      )}

      {!isLoggedIn && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-bold">Admin Login</h2>
            <Input
              type="text"
              placeholder="Enter Admin ID"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
            />
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoggedIn && (
        <Card>
          <CardContent className="space-y-6 p-6">
            <h2 className="text-xl font-bold">Add Book</h2>
            <BookFormFields form={bookForm} onChange={handleBookFormChange} />
            <Button onClick={handleAddBook} disabled={loading}>
              {loading ? 'Adding Book...' : 'Add Book'}
            </Button>
          </CardContent>
        </Card>
      )}

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
