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

// Background gradients keyed by time, then modified by weather
const timeGradients: Record<TimeOfDay, string> = {
  night:   'linear-gradient(180deg, #0a0a1a 0%, #0d1b2a 30%, #1b2838 60%, #1a2a1a 85%, #1d3a1d 100%)',
  dawn:    'linear-gradient(180deg, #1a1a2e 0%, #2d1b4e 20%, #6b3a7d 40%, #d4726a 60%, #2a4a2a 85%, #1d3a1d 100%)',
  morning: 'linear-gradient(180deg, #3a5f8a 0%, #6b9bc0 25%, #a8c8e8 45%, #d4e4f0 60%, #3a6a3a 85%, #2d5a27 100%)',
  day:     'linear-gradient(180deg, #1e5799 0%, #2989d8 25%, #7db9e8 50%, #a8d8ea 65%, #3a7a3a 85%, #2d5a27 100%)',
  evening: 'linear-gradient(180deg, #1a2a4a 0%, #4a3a6a 20%, #c0605a 40%, #e8a060 55%, #3a5a3a 80%, #2d4a27 100%)',
  dusk:    'linear-gradient(180deg, #1a1a3e 0%, #3a2a5e 25%, #7a4a6a 45%, #4a3a5a 65%, #2a4a2a 85%, #1d3a1d 100%)',
}

// Weather overlays modify the gradient
const weatherOverrides: Record<WeatherType, Partial<Record<TimeOfDay, string>>> = {
  clear: {}, // use base gradient
  clouds: {
    day:     'linear-gradient(180deg, #4a6a8a 0%, #6a8aaa 25%, #8aa8c8 50%, #a0b8c8 65%, #3a6a3a 85%, #2d5a27 100%)',
    morning: 'linear-gradient(180deg, #4a6a80 0%, #7a9aaa 25%, #98b0c0 45%, #b0c0cc 60%, #3a6a3a 85%, #2d5a27 100%)',
    evening: 'linear-gradient(180deg, #2a2a4a 0%, #4a3a5a 20%, #8a6060 40%, #a08070 55%, #3a5a3a 80%, #2d4a27 100%)',
  },
  fog: {
    day:     'linear-gradient(180deg, #6a7a8a 0%, #8a9aa8 25%, #a0aab8 50%, #b8c0c8 65%, #5a6a5a 85%, #4a5a4a 100%)',
    morning: 'linear-gradient(180deg, #5a6a78 0%, #7a8a98 25%, #98a0a8 45%, #a8b0b8 60%, #5a6a5a 85%, #4a5a4a 100%)',
    night:   'linear-gradient(180deg, #1a1a2a 0%, #2a2a3a 30%, #3a3a4a 60%, #2a3a2a 85%, #2a3a2a 100%)',
  },
  rain: {
    day:     'linear-gradient(180deg, #3a4a5a 0%, #4a5a6a 25%, #5a6a7a 50%, #6a7a88 65%, #3a5a3a 85%, #2a4a2a 100%)',
    morning: 'linear-gradient(180deg, #3a4a58 0%, #4a5a68 25%, #5a6878 45%, #6a7888 60%, #3a5a3a 85%, #2a4a2a 100%)',
    evening: 'linear-gradient(180deg, #1a2a3a 0%, #2a3a4a 20%, #4a4a5a 40%, #5a5a68 55%, #2a4a2a 80%, #1d3a1d 100%)',
    night:   'linear-gradient(180deg, #0a0a1a 0%, #1a1a2a 30%, #2a2a3a 60%, #1a2a1a 85%, #1a2a1a 100%)',
  },
  snow: {
    day:     'linear-gradient(180deg, #7a8a9a 0%, #9aa8b8 25%, #b0bcc8 50%, #c8d0d8 65%, #6a7a6a 85%, #5a6a5a 100%)',
    morning: 'linear-gradient(180deg, #6a7a88 0%, #8a98a8 25%, #a0b0b8 45%, #b8c0c8 60%, #6a7a6a 85%, #5a6a5a 100%)',
    night:   'linear-gradient(180deg, #1a1a2a 0%, #2a2a3a 30%, #3a3a4a 60%, #2a3a3a 85%, #2a3a3a 100%)',
  },
  storm: {
    day:     'linear-gradient(180deg, #2a3040 0%, #3a4050 25%, #4a5060 50%, #5a6070 65%, #2a4a2a 85%, #1d3a1d 100%)',
    morning: 'linear-gradient(180deg, #2a3040 0%, #3a4050 25%, #4a5060 45%, #5a6070 60%, #2a4a2a 85%, #1d3a1d 100%)',
    evening: 'linear-gradient(180deg, #1a1a2a 0%, #2a2030 20%, #3a3040 40%, #4a4050 55%, #2a3a2a 80%, #1d2a1d 100%)',
    night:   'linear-gradient(180deg, #08080e 0%, #10101a 30%, #1a1a28 60%, #141e14 85%, #141e14 100%)',
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
  background: timeGradients.night,
  showStars: true,
  weather: 'clear',
  timeOfDay: 'night',
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
