import api from '@/lib/api';

class UploadsService {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ fileName: string; url: string }>(
      '/uploads/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return data;
  }
}

export default new UploadsService();
