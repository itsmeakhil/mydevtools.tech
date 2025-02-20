export const commonPatterns = [
    { name: "@yearly", cron: "0 0 1 1 *", description: "Once every year at midnight of 1 January" },
    { name: "@annually", cron: "0 0 1 1 *", description: "Same as @yearly" },
    { name: "@monthly", cron: "0 0 1 * *", description: "Once a month at midnight on the first day" },
    { name: "@weekly", cron: "0 0 * * 0", description: "Once a week at midnight on Sunday morning" },
    { name: "@daily", cron: "0 0 * * *", description: "Once a day at midnight" },
    { name: "@midnight", cron: "0 0 * * *", description: "Same as @daily" },
    { name: "@hourly", cron: "0 * * * *", description: "Once an hour at the beginning of the hour" },
  ]
  
  export const interpretCron = (cronString: string, use24Hour = true): string => {
    const parts = cronString.split(" ")
    if (parts.length !== 5) return "Invalid cron expression"
  
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  
    // Check if any part is invalid
    if ([minute, hour, dayOfMonth, month, dayOfWeek].some((part) => part === "undefined" || part === "null" || !part)) {
      return "Invalid cron expression"
    }
  
    let description = "At"
  
    // Minute
    if (minute === "*") {
      description += " every minute"
    } else {
      description += ` ${minute} minute${minute === "1" ? "" : "s"} past`
    }
  
    // Hour
    if (hour !== "*") {
      const hourNum = Number.parseInt(hour)
      if (!isNaN(hourNum)) {
        if (use24Hour) {
          description += ` ${hour}:00`
        } else {
          const period = hourNum >= 12 ? "PM" : "AM"
          const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
          description += ` ${hour12}${period}`
        }
      }
    } else if (minute !== "*") {
      description += " the hour"
    }
  
    // Day of Week
    if (dayOfWeek !== "*") {
      const dayNum = Number.parseInt(dayOfWeek)
      if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        description += `, only on ${days[dayNum]}`
      }
    }
  
    // Month
    if (month !== "*") {
      const monthNum = Number.parseInt(month)
      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]
        description += `, in ${months[monthNum - 1]}`
      }
    }
  
    // Day of Month
    if (dayOfMonth !== "*") {
      const dom = Number.parseInt(dayOfMonth)
      if (!isNaN(dom) && dom >= 1 && dom <= 31) {
        description += `, on day ${dayOfMonth} of the month`
      }
    }
  
    return description
  }
  
  export const validateCronPart = (value: string, min: number, max: number): boolean => {
    if (value === "*") return true
    const num = Number.parseInt(value)
    return !isNaN(num) && num >= min && num <= max
  }
  
  