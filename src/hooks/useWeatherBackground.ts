import { useState, useEffect } from 'react'

// WMO weather codes: https://open-meteo.com/en/docs
// 0 = clear, 1-3 = partly cloudy/overcast, 45-48 = fog,
// 51-67 = drizzle/rain, 71-77 = snow, 80-82 = showers, 85-86 = snow showers, 95-99 = thunderstorm
type WeatherType = 'clear' | 'clouds' | 'fog' | 'rain' | 'snow' | 'storm'

function classifyWeather(code: number): WeatherType {
  if (code === 0) return 'clear'
  if (code <= 3) return 'clouds'
  if (code <= 48) return 'fog'
  if (code <= 67 || (code >= 80 && code <= 82)) return 'rain'
  if (code <= 77 || (code >= 85 && code <= 86)) return 'snow'
  return 'storm'
}

type TimeOfDay = 'night' | 'dawn' | 'morning' | 'day' | 'evening' | 'dusk'

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 22 || hour < 5) return 'night'
  if (hour < 7) return 'dawn'
  if (hour < 10) return 'morning'
  if (hour < 17) return 'day'
  if (hour < 19) return 'evening'
  return 'dusk'
}

// Bright sky-to-meadow gradients keyed by time
const timeGradients: Record<TimeOfDay, string> = {
  night:   'linear-gradient(180deg, #1a1a4e 0%, #2a2a6e 30%, #3a3a7e 60%, #2a4a3a 85%, #1d3a2d 100%)',
  dawn:    'linear-gradient(180deg, #6a7ab8 0%, #c4a0c8 20%, #f0b8a0 40%, #f8d8a0 60%, #7ab87a 85%, #5DB85D 100%)',
  morning: 'linear-gradient(180deg, #7ac8ee 0%, #a0d8f8 25%, #c8e8f8 45%, #d8f0e0 60%, #7ab87a 85%, #5DB85D 100%)',
  day:     'linear-gradient(180deg, #87CEEB 0%, #B8E2F8 25%, #d4efc4 50%, #b8e0b0 65%, #7ab87a 85%, #5DB85D 100%)',
  evening: 'linear-gradient(180deg, #5a6a9a 0%, #c88070 20%, #f0a870 40%, #f8c888 55%, #7aaa6a 80%, #5a9a5a 100%)',
  dusk:    'linear-gradient(180deg, #4a5a8a 0%, #7a6a9a 25%, #b87a8a 45%, #a07a8a 65%, #5a8a5a 85%, #3a7a3a 100%)',
}

// Weather overlays modify the gradient
const weatherOverrides: Record<WeatherType, Partial<Record<TimeOfDay, string>>> = {
  clear: {}, // use base gradient
  clouds: {
    day:     'linear-gradient(180deg, #8ab8d0 0%, #a0c8d8 25%, #c0d8e0 50%, #d0e0d0 65%, #7ab87a 85%, #5DB85D 100%)',
    morning: 'linear-gradient(180deg, #80b0c8 0%, #98c0d0 25%, #b0d0d8 45%, #c0d8d0 60%, #7ab87a 85%, #5DB85D 100%)',
    evening: 'linear-gradient(180deg, #5a6888 0%, #a07878 20%, #c89078 40%, #d0a888 55%, #6a9a6a 80%, #5a8a5a 100%)',
  },
  fog: {
    day:     'linear-gradient(180deg, #a0b0c0 0%, #b0c0c8 25%, #c0c8d0 50%, #d0d8d8 65%, #8a9a8a 85%, #7a8a7a 100%)',
    morning: 'linear-gradient(180deg, #90a8b8 0%, #a0b8c0 25%, #b8c0c8 45%, #c8d0d0 60%, #8a9a8a 85%, #7a8a7a 100%)',
    night:   'linear-gradient(180deg, #2a2a4a 0%, #3a3a5a 30%, #4a4a6a 60%, #3a4a3a 85%, #3a4a3a 100%)',
  },
  rain: {
    day:     'linear-gradient(180deg, #6a8a9a 0%, #7a9aaa 25%, #8aaab8 50%, #98b0b8 65%, #6a8a6a 85%, #5a7a5a 100%)',
    morning: 'linear-gradient(180deg, #6a8898 0%, #7a98a8 25%, #8aa8b8 45%, #98b8c0 60%, #6a8a6a 85%, #5a7a5a 100%)',
    evening: 'linear-gradient(180deg, #4a5a7a 0%, #5a6a7a 20%, #7a7a88 40%, #8a8a98 55%, #5a7a5a 80%, #4a6a4a 100%)',
    night:   'linear-gradient(180deg, #1a1a3a 0%, #2a2a4a 30%, #3a3a5a 60%, #2a3a2a 85%, #2a3a2a 100%)',
  },
  snow: {
    day:     'linear-gradient(180deg, #a0c0d8 0%, #c0d8e8 25%, #d8e8f0 50%, #e8f0f8 65%, #b0c0b0 85%, #9ab09a 100%)',
    morning: 'linear-gradient(180deg, #98b8d0 0%, #b0d0e0 25%, #c8e0e8 45%, #d8e8f0 60%, #b0c0b0 85%, #9ab09a 100%)',
    night:   'linear-gradient(180deg, #2a2a4a 0%, #3a3a5a 30%, #4a4a6a 60%, #3a4a4a 85%, #3a4a4a 100%)',
  },
  storm: {
    day:     'linear-gradient(180deg, #5a6a78 0%, #6a7a88 25%, #7a8a98 50%, #8a98a0 65%, #5a7a5a 85%, #4a6a4a 100%)',
    morning: 'linear-gradient(180deg, #5a6a78 0%, #6a7a88 25%, #7a8a98 45%, #8a98a0 60%, #5a7a5a 85%, #4a6a4a 100%)',
    evening: 'linear-gradient(180deg, #3a4a5a 0%, #4a4a5a 20%, #5a5a68 40%, #6a6a78 55%, #4a5a4a 80%, #3a4a3a 100%)',
    night:   'linear-gradient(180deg, #10102a 0%, #1a1a3a 30%, #2a2a4a 60%, #1a2a1a 85%, #1a2a1a 100%)',
  },
}

export interface WeatherState {
  background: string
  showStars: boolean
  weather: WeatherType
  timeOfDay: TimeOfDay
  temperature: number | null
}

const FALLBACK: WeatherState = {
  background: timeGradients.day,
  showStars: false,
  weather: 'clear',
  timeOfDay: 'day',
  temperature: null,
}

export function useWeatherBackground(): WeatherState {
  const [state, setState] = useState<WeatherState>(() => {
    const tod = getTimeOfDay(new Date().getHours())
    return {
      background: timeGradients[tod],
      showStars: tod === 'night' || tod === 'dusk' || tod === 'dawn',
      weather: 'clear',
      timeOfDay: tod,
      temperature: null,
    }
  })

  useEffect(() => {
    let cancelled = false

    // Update time-based background every minute
    const updateTime = () => {
      const tod = getTimeOfDay(new Date().getHours())
      setState(prev => {
        if (prev.timeOfDay === tod) return prev
        const bg = weatherOverrides[prev.weather][tod] ?? timeGradients[tod]
        return { ...prev, timeOfDay: tod, background: bg, showStars: tod === 'night' || tod === 'dusk' || tod === 'dawn' }
      })
    }
    const interval = setInterval(updateTime, 60000)

    // Fetch weather
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (cancelled) return
          try {
            const { latitude, longitude } = pos.coords
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,temperature_2m`
            )
            if (!res.ok || cancelled) return
            const data = await res.json()
            const code: number = data.current?.weather_code ?? 0
            const temp: number | null = data.current?.temperature_2m ?? null
            const weather = classifyWeather(code)
            const tod = getTimeOfDay(new Date().getHours())
            const bg = weatherOverrides[weather][tod] ?? timeGradients[tod]
            setState({
              background: bg,
              showStars: (tod === 'night' || tod === 'dusk' || tod === 'dawn') && (weather === 'clear' || weather === 'clouds'),
              weather,
              timeOfDay: tod,
              temperature: temp,
            })
          } catch {
            // keep time-based fallback
          }
        },
        () => {
          // geolocation denied — keep time-based fallback
        },
        { timeout: 5000 }
      )
    }

    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return state ?? FALLBACK
}
