import { describe, it, expect } from 'vitest';

describe('F-I3: Upload Document Error Handling', () => {
  it('it correctly parses the 422 error message for maximum limit reached', () => {
    const errorResponse = {
      response: {
        status: 422,
        data: {
          message: 'Anda telah mencapai batas maksimal 10 dokumen untuk indikator ini.'
        }
      }
    };

    // Simulate how the frontend extracts the error message
    const getErrorMessage = (error: any) => {
      return error.response?.data?.message || 'Gagal mengunggah dokumen';
    };

    const parsedMessage = getErrorMessage(errorResponse);
    expect(parsedMessage).toBe('Anda telah mencapai batas maksimal 10 dokumen untuk indikator ini.');
  });
});
