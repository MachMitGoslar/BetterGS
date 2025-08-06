import { Pipe, PipeTransform } from '@angular/core';



@Pipe({
  name: 'elapsedTime'
})
export class ElapsedTimePipe implements PipeTransform {

  /**
   * Formats elapsed time depending on the specified precision. Default is seconds.
   * @param value The elapsed time in milliseconds.
   * @param precision The precision to format the time. Default is Precision.S (seconds).
   * @returns A formatted string representing the elapsed time.
   * The format is HH:mm:ss for seconds precision, HH:mm for minutes precision,
   * HH for hours precision, and HH:mm:ss:SSS for milliseconds precision.
   */
  transform(value: number | null, precision: "ms" | "s" | "m" | "h" = "s"): string {
    if (value === null || value < 0) {
      value = 0; // Ensure non-negative value
    }
    const totalSeconds = Math.floor(value / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = value % 1000;

    switch (precision) {
      case "ms":
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
      case "s":
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      case "m":
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      case "h":
        return `${hours.toString().padStart(2, '0')}`;
      default:
        // Fallback to default precision (seconds)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }


  }

}
