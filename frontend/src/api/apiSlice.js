import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://factory-store-management.vercel.app/api',
    prepareHeaders: (headers, { endpoint }) => {
      const isFormData = endpoint === 'createItem' || endpoint === 'updateItem';
      if (isFormData) {
        headers.delete('Content-Type');
      }
      return headers;
    },
  }),

  tagTypes: ['Category', 'Item', 'Transaction', 'ActiveBorrows'],

  endpoints: (builder) => ({

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

  getTransactions: builder.query({
    query: () => '/transactions',
    providesTags: ['Transaction'],
  }),

  addStock: builder.mutation({
    query: ({ id, quantity }) => ({
      url: `/transactions/add-stock/${id}`,
      method: 'POST',
      body: { quantity },
    }),
    invalidatesTags: ['Item', 'Transaction'],
  }),

  issueStock: builder.mutation({
    query: ({ id, quantity, receiver }) => ({
      url: `/transactions/issue/${id}`,
      method: 'POST',
      body: { quantity, receiver },
    }),
    invalidatesTags: ['Item', 'Transaction'],
  }),

  borrowItem: builder.mutation({
    query: ({ id, quantity, receiver, expectedReturnDate, notes }) => ({
      url: `/transactions/borrow/${id}`,
      method: 'POST',
      body: { quantity, receiver, expectedReturnDate, notes },
    }),
    invalidatesTags: ['Item', 'Transaction', 'ActiveBorrows'],
  }),

  returnItem: builder.mutation({
    query: ({ borrowTransactionId, notes }) => ({
      url: '/transactions/return',
      method: 'POST',
      body: { borrowTransactionId, notes },
    }),
    invalidatesTags: ['Item', 'Transaction', 'ActiveBorrows'],
  }),

  getActiveBorrows: builder.query({
    query: () => '/transactions/active-borrows',
    providesTags: ['ActiveBorrows'],
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