import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

    prepareHeaders: (headers, { endpoint }) => {
      const isFormData = endpoint === 'createItem' || endpoint === 'updateItem';
      if (isFormData) {
        headers.delete('Content-Type');
      }
      return headers;
    },
  }),

  tagTypes: ['Category', 'Item', 'Transaction'],

  endpoints: (builder) => ({

    // ─── Categories ────────────────────────────────────────────────────────────
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    createCategory: builder.mutation({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Category'],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // ─── Items ─────────────────────────────────────────────────────────────────
    getItems: builder.query({
      query: () => '/items',
      providesTags: ['Item'],
    }),

    createItem: builder.mutation({
      query: (formData) => ({
        url: '/items',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Item'],
    }),

    updateItem: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/items/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Item'],
    }),

    deleteItem: builder.mutation({
      query: (id) => ({
        url: `/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Item'],
    }),

    // ─── Transactions ──────────────────────────────────────────────────────────
    getTransactions: builder.query({
      query: () => '/transactions',
      providesTags: ['Transaction'],
    }),

    addStock: builder.mutation({
      query: ({ id, quantity, notes }) => ({
        url: `/transactions/add-stock/${id}`,
        method: 'POST',
        body: { quantity, notes },
      }),
      invalidatesTags: ['Item', 'Transaction'],
    }),

    issueStock: builder.mutation({
      query: ({ id, quantity, receiver, notes }) => ({
        url: `/transactions/issue/${id}`,
        method: 'POST',
        body: { quantity, receiver, notes },
      }),
      invalidatesTags: ['Item', 'Transaction'],
    }),

    // ─── Borrow / Return ───────────────────────────────────────────────────────
    borrowItem: builder.mutation({
      query: ({ id, quantity, borrower, notes, expectedReturnDate }) => ({
        url: `/transactions/borrow/${id}`,
        method: 'POST',
        body: { quantity, borrower, notes, expectedReturnDate },
      }),
      invalidatesTags: ['Item', 'Transaction'],
    }),

    returnItem: builder.mutation({
      query: ({ transactionId, notes }) => ({
        url: '/transactions/return',
        method: 'POST',
        body: { transactionId, notes },
      }),
      invalidatesTags: ['Item', 'Transaction'],
    }),

    getActiveBorrows: builder.query({
      query: () => '/transactions/active-borrows',
      providesTags: ['Transaction'],
    }),

  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  useGetItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,

  useGetTransactionsQuery,
  useAddStockMutation,
  useIssueStockMutation,
  useBorrowItemMutation,
  useReturnItemMutation,
  useGetActiveBorrowsQuery,
} = apiSlice;