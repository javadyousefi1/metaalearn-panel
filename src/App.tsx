import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import { queryClient } from '@/config';
import { router } from '@/router';

/**
 * Main App Component
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={faIR}
        direction="rtl"
        theme={{
          token: {
            colorPrimary: '#0ea5e9',
            borderRadius: 8,
            fontFamily: 'Vazirmatn, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
