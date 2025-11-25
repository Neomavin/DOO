import api from './api';

class UploadsService {
  async uploadImage(file: { uri: string; name: string; type: string }) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

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
