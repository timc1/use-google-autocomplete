interface GoogleProps {
  types?: '(cities)' | 'geocode' | 'establishments' | 'address'
  language?: string
  location?: ''
  radius?: number
  strictbounds?: boolean
  offset?: number
}

export interface AutocompleteProps {
  apiKey: string
  query: string
  type?: 'places' | 'query'
  debounceMs?: number
  options?: GoogleProps
}

interface ReturnProps {
  results: {
    predictions: any[]
    status: string
  }
  isLoading: boolean
  error: null | string
  getPlaceDetails: any
  cancelQuery: (id: string) => void
}

declare module 'use-google-autocomplete' {
  export default function useGoogleAutocomplete(
    props: AutocompleteProps
  ): ReturnProps
}
