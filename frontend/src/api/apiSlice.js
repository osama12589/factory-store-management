import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',  

  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',

      prepareHeaders: (headers, { getState, endpoint }) => {
      // Don't set Content-Type when uploading files (FormData)
      // Let browser set it automatically with the correct boundary
      const isFormData = endpoint === 'createItem' || endpoint === 'updateItem';

      if (isFormData) {
        headers.delete('Content-Type'); // Let browser set multipart boundary
      }

      return headers;
    },
  }),

  tagTypes: ['Category', 'Item', 'Transaction'],

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
    body: formData, // formData can include image if using multipart/form-data
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
} = apiSlice;
