<h1 align="center">
  use-google-autocomplete ⌨️
</h1>
<p align="center" style="font-size: 1.5rem;">
  A simple React Hook API that returns Google Autocomplete results with session_token handling. 
</p>

## Problem

Google's Maps Javascript SDK gives us a default autocomplete experience, with a slightly customizable UI through class names; however, if we want to create a ground up search experience, we'll need to use their [REST API](https://developers.google.com/places/web-service/autocomplete). We want to do something like this:

### demo here

The two primary things we need to focus on are:

1. Handle session_tokens
   Every time we send a request to the REST endpoint, we need to pass a session_token in order for Google to group
   shared calls together for billing purposes. Google recommends uuid4 ids, and after a bit of research, [3 minutes](https://stackoverflow.com/questions/50398801/how-long-do-the-new-places-api-session-tokens-last/50452233#50452233) is the limit for the lifetime of a session_token, though we need to refresh the session_token when we make a new query to fetch more details about a specific place.

2. Debounce API calls
   We dont' want to be sending an API call on every single keystroke, so we'll need to debounce each
   keystroke and only call the API when a user finishes typing.

## The Solution

`use-google-autocomplete` handles session_tokens by using the recommended `uuid4/v4` package to
generate unique ids, renewing every 180000ms (3 minutes), and when a user calls `getPlaceDetails()` to fetch more information regarding a specific place.

## Usage

```
yarn add use-google-autocomplete
```

or

```
npm install use-google-autocomplete
```

```
import useGoogleAutocomplete from 'use-google-autocomplete'

// This will update each time a new `query` prop is passed.
const { results, isLoading, error, getPlaceDetails } = useGoogleAutocomplete({
  apiKey: '<API_KEY>',
  query: 'New York',
  options: {
    types: '(cities)',
  },
})

```

## Props

### apiKey

> String value of your Google API key. Make sure to enable the Maps API in your console.
