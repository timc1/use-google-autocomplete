import React from 'react'
// @ts-ignore
import uuid4 from 'uuid/v4'

const initialState = {
  results: [],
  isLoading: false,
  error: null,
}

const cors =
  process.env.NODE_ENV !== 'production'
    ? 'https://cors-anywhere.herokuapp.com/'
    : ''

type GoogleProps = {
  types?: '(cities)' | 'geocode' | 'establishments' | 'address'
  language?: string
  location?: ''
  radius?: number
  strictbounds?: boolean
}

type AutocompleteProps = {
  apiKey: string
  query: string
  debounceMs?: number
  options?: GoogleProps
}

export default function useGoogleAutocomplete({
  apiKey,
  query,
  debounceMs = 400,
  options = {},
}: AutocompleteProps) {
  const [results, dispatch] = React.useReducer(reducer, initialState)

  // Refs for unique session_tokens, for billing purposes
  // Reference: https://developers.google.com/places/web-service/autocomplete
  const sessionToken = React.useRef<string>(uuid4())
  const sessionTokenTimeout = React.useRef<number>()

  React.useEffect(() => {
    // Setup a timer to reset our session_token every 3 minutes.
    // Reference: (https://stackoverflow.com/questions/50398801/how-long-do-the-new-places-api-session-tokens-last/50452233#50452233)
    sessionTokenTimeout.current = window.setInterval(resetSessionToken, 180000)

    // Cleanup clearInterval on unmount.
    return () => clearInterval(sessionTokenTimeout.current)
  }, [])

  // Flag to make sure our useEffect does not run on initial render.
  const initialRender = React.useRef<boolean>(false)
  // Debounce our search to only trigger an API call when user stops typing after (n)ms.
  const debouncedFn = React.useRef<any>()
  // Effect triggers on every query change.
  React.useEffect(() => {
    if (initialRender.current === false) {
      initialRender.current = true
      return
    }

    // Cancel previous debounced call.
    if (debouncedFn.current) debouncedFn.current.clear()

    dispatch({
      type: 'LOADING',
    })

    debouncedFn.current = debounce(() => {
      const types = options.types ? `&types=${options.types}` : ''
      const language = options.language ? `&language=${options.language}` : ''
      const location = options.location ? `&location=${options.location}` : ''
      const radius = options.radius ? `&radius=${options.radius}` : ''
      const strictbounds = options.strictbounds ? `&strictbounds` : ''

      const url = `${cors}https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}${types}${language}${location}${radius}${strictbounds}&key=${apiKey}&sessiontoken=${
        sessionToken.current
      }`

      fetch(url)
        .then(data => data.json())
        .then(data => {
          console.log('data', data)
          dispatch({
            type: data.status,
            payload: {
              data,
            },
          })
        })
    }, debounceMs)

    debouncedFn.current()
  }, [
    query,
    debounceMs,
    apiKey,
    options.types,
    options.language,
    options.location,
    options.radius,
    options.strictbounds,
  ])

  const resetSessionToken = () => {
    sessionToken.current = uuid4()
  }

  return {
    results,
  }
}

const reducer = (
  state: any,
  action: {
    type: string
    payload?: any
  }
) => {
  // All cases, beside 'LOADING', are status codes provided from Google Autocomplete API's response.
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        isLoading: true,
      }
    case 'OK':
      return {
        ...state,
        results: action.payload.data,
        isLoading: false,
        error: null,
      }
    case 'ZERO_RESULTS':
      return {
        ...state,
        results: [],
        isLoading: false,
        error: null,
      }
    case 'INVALID_REQUEST':
      return {
        ...state,
        isLoading: false,
        error: null,
      }
    case 'REQUEST_DENIED':
      return {
        ...state,
        isLoading: false,
        error: `Invalid 'key' parameter`,
      }
    case 'UNKNOWN_ERROR':
      return {
        ...state,
        isLoading: false,
        error: `Unknown error, refresh and try again.`,
      }
    default:
      return state
  }
}

// Credit David Walsh (https://davidwalsh.name/javascript-debounce-function)

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func: () => any, wait: number, immediate?: boolean) {
  let timeout: any

  const executedFunction = function(this: any) {
    let context = this
    let args: any = arguments

    let later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }

    let callNow = immediate && !timeout

    clearTimeout(timeout)

    timeout = setTimeout(later, wait)

    if (callNow) func.apply(context, args)
  }

  executedFunction.clear = function() {
    clearTimeout(timeout)
    timeout = null
  }

  return executedFunction
}
