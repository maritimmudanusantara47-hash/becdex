// Type definitions for global declarations

export interface User {
  id: number;
  name: string;
  email: string;
  image: string;
  legal_documents?: string | null;
  organizational_chart?: string | null;
  is_active: number;
  role: {
    id: number;
    name: string;
  };
  company?: {
    phone: string | null;
    country: string | null;
    company_field_id: number | null;
    company_field: string | null;
    pic_name: string;
    pic_position: string;
    pic_email: string;
    pic_phone: string;
    becdex_category: string | null;
    description: string | null;
    address: string | null;
    website: string | null;
    brand_name: string | null;
  };
  email_verified_at: string | null;
  created_at: string;
}

export interface SubmissionStatus {
  id: number;
  name: string;
  color: string;
}

export interface Submission {
  id: string;
  status: SubmissionStatus;
  initial_score: number;
  valid_score: number;
  survey_score: number;
  can_proceed_to_payment: boolean;
  has_successful_payment: boolean;
  is_post_survey_revision?: boolean;
  requires_payment?: boolean;
  documents_uploaded: number;
  reason: string | null;
  created_at: string;
  updated_at: string;
  revision_count?: number;
  current_upload_phase?: number;
  radar_data?: { subject: string; A: number; B: number; fullMark: number }[];
  user?: User;
  payment?: PaymentTransaction | null;
  certificate?: CertificateUser | null;
  survey?: Survey | null;
}

export interface SubmissionDetail extends Submission {
  per_indicators: PerIndicator[];
  answers: Answer[];
  documents: Document[];
}

export interface PerIndicator {
  id: number;
  submission_id: string;
  indicator_id: number;
  status: {
    id: number;
    name: string;
    color: string;
  };
  comment: string | null;
  indicator: {
    id: number;
    name: string;
    name_id: string | null;
    description: string | null;
    description_en: string | null;
    evidence: string | null;
    evidence_en: string | null;
    verification_method: string | null;
    verification_method_en: string | null;
    regulation: string | null;
    regulation_en: string | null;
    is_mandatory?: boolean;
    principle: {
      id: number;
      name: string;
      name_id: string | null;
      outcome: {
        id: number;
        name: string;
        name_id: string | null;
        aspect: {
          id: number;
          name: string;
          name_id: string | null;
        };
      };
    };
    questions: Question[];
  };
}

export interface Question {
  id: number;
  indicator_id: number;
  text: string;
  text_en: string | null;
  is_mandatory: boolean;
}

export interface Answer {
  id: number;
  submission_id: string;
  question_id: number;
  value: number | null;
  valid_value: number | null;
  question: Question;
}

export interface Document {
  id: number;
  indicator_id: number;
  indicator?: string;
  file_url: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  upload_phase?: number;
  uploaded_at: string;
}

export interface PaymentTransaction {
  id: number;
  order_id: string;
  amount: number;
  payment_type: string | null;
  transaction_status: string;
  va_number: string | null;
  bank: string | null;
  invoice_url: string | null;
  xendit_invoice_id: string | null;
  paid_at: string | null;
  expired_at: string | null;
  is_expired: boolean;
  created_at: string;
}

export interface CertificateUser {
  id: number;
  mmic: string | null;
  direktur: string | null;
  published_at: string | null;
  valid_until: string | null;
  is_valid: boolean;
  is_approved?: boolean;
  category?: {
    name: string;
    file_url: string;
  };
}

export interface Survey {
  scheduled_at: string;
  location_link: string | null;
  notes: string | null;
}

export interface ScoreData {
  submission_id: string;
  initial_score: number;
  valid_score: number;
  survey_score: number;
  documents_uploaded: number;
  can_proceed_to_payment: boolean;
  has_successful_payment: boolean;
  requirements: {
    min_initial_score: number;
    min_documents: number;
    score_met: boolean;
    documents_met: boolean;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Midtrans global type
declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: Record<string, unknown>) => void;
          onPending?: (result: Record<string, unknown>) => void;
          onError?: (result: Record<string, unknown>) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}
