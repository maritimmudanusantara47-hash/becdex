import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:8000/api';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockCompanyUser = {
  id: 1,
  name: 'PT Test Perusahaan',
  email: 'company@test.com',
  role: { id: 2, name: 'company' },
  is_active: 1,
  company_detail: {
    company_phone: '0812345678',
    pic_name: 'Budi Santoso',
    address: 'Jl. Test No. 1',
  },
};

const mockAdminUser = {
  id: 100,
  name: 'Admin BECdex',
  email: 'admin@becdex.id',
  role: { id: 1, name: 'admin' },
  is_active: 1,
  company_detail: null,
};

const mockSubmission = {
  id: 'sub-uuid-001',
  user_id: 1,
  submission_status_id: 2,
  status: { id: 2, name: 'Document Submission', color: 'info' },
  initial_score: 0,
  valid_score: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockDashboardStats = {
  total_submissions: 42,
  pending_review: 8,
  certified: 15,
  total_users: 120,
  certifications_by_sector: [],
  submissions_trend: [
    { month: 'Jan', count: 3 },
    { month: 'Feb', count: 5 },
    { month: 'Mar', count: 4 },
  ],
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // ─── Auth ─────────────────────────────────────────────────────────────────

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (body.email === 'admin@becdex.id') {
      return HttpResponse.json({ user: mockAdminUser }, { status: 200 });
    }
    if (body.email === 'company@test.com' && body.password === 'password') {
      return HttpResponse.json({ user: mockCompanyUser }, { status: 200 });
    }
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as Record<string, string>;
    if (!body.email || !body.password) {
      return HttpResponse.json({ errors: { email: ['required'] } }, { status: 422 });
    }
    return HttpResponse.json(
      { message: 'Registration successful. Please wait for admin approval.' },
      { status: 201 }
    );
  }),

  http.delete(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully.' }, { status: 200 });
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({ data: mockCompanyUser }, { status: 200 });
  }),

  // ─── Submissions ──────────────────────────────────────────────────────────

  http.get(`${API_URL}/submissions`, () => {
    return HttpResponse.json({ data: [mockSubmission] }, { status: 200 });
  }),

  http.get(`${API_URL}/submissions/:id`, ({ params }) => {
    return HttpResponse.json(
      { data: { ...mockSubmission, id: params.id } },
      { status: 200 }
    );
  }),

  http.post(`${API_URL}/submissions`, () => {
    return HttpResponse.json({ data: mockSubmission }, { status: 201 });
  }),

  http.post(`${API_URL}/submissions/:id/submit`, ({ params }) => {
    return HttpResponse.json(
      { data: { ...mockSubmission, id: params.id, submission_status_id: 3 } },
      { status: 200 }
    );
  }),

  http.post(`${API_URL}/submissions/:id/payment`, ({ params }) => {
    return HttpResponse.json(
      {
        message: 'Payment initiated.',
        data: {
          submission_id: params.id,
          invoice_url: 'https://checkout.xendit.co/web/test-invoice',
          expired_at: new Date(Date.now() + 86400000).toISOString(),
        },
      },
      { status: 200 }
    );
  }),

  // ─── Admin ────────────────────────────────────────────────────────────────

  http.get(`${API_URL}/admin/submissions`, () => {
    return HttpResponse.json(
      {
        data: [
          { ...mockSubmission, submission_status_id: 3 },
          { ...mockSubmission, id: 'sub-uuid-002', submission_status_id: 6 },
        ],
        meta: { current_page: 1, total: 2 },
      },
      { status: 200 }
    );
  }),

  http.get(`${API_URL}/admin/dashboard/stats`, () => {
    return HttpResponse.json({ data: mockDashboardStats }, { status: 200 });
  }),

  http.post(`${API_URL}/admin/submissions/:id/approve`, () => {
    return HttpResponse.json({ message: 'Submission approved.' }, { status: 200 });
  }),

  http.post(`${API_URL}/admin/submissions/:id/reject`, () => {
    return HttpResponse.json({ message: 'Submission rejected.' }, { status: 200 });
  }),

  http.post(`${API_URL}/admin/submissions/:id/survey`, () => {
    return HttpResponse.json({ message: 'Survey scheduled.' }, { status: 200 });
  }),

  http.post(`${API_URL}/admin/submissions/:id/certificate`, () => {
    return HttpResponse.json({ message: 'Certificate issued.' }, { status: 200 });
  }),

  // ─── Public ───────────────────────────────────────────────────────────────

  http.get(`${API_URL}/public/verified-companies`, () => {
    return HttpResponse.json({ data: [] }, { status: 200 });
  }),

  http.get(`${API_URL}/public/cms`, () => {
    return HttpResponse.json({ data: [] }, { status: 200 });
  }),

  http.get(`${API_URL}/public/indicators`, () => {
    return HttpResponse.json({ data: [] }, { status: 200 });
  }),

  // ─── Notifications ────────────────────────────────────────────────────────

  http.get(`${API_URL}/notifications`, () => {
    return HttpResponse.json({ data: [] }, { status: 200 });
  }),
];
