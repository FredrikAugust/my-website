import ExifReader from 'exifreader'

export interface ExifData {
  cameraMake?: string
  cameraModel?: string
  lensMake?: string
  lensModel?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: number
  takenAt?: string
  latitude?: number
  longitude?: number
}

export async function extractExifData(buffer: Buffer): Promise<ExifData | null> {
  try {
    const tags = await ExifReader.load(buffer, { expanded: true })

    const exifData: ExifData = {}

    // Camera info
    if (tags.exif?.Make?.description) {
      exifData.cameraMake = tags.exif.Make.description
    }
    if (tags.exif?.Model?.description) {
      exifData.cameraModel = tags.exif.Model.description
    }

    // Lens info
    if (tags.exif?.LensMake?.description) {
      exifData.lensMake = tags.exif.LensMake.description
    }
    if (tags.exif?.LensModel?.description) {
      exifData.lensModel = tags.exif.LensModel.description
    }

    // Camera settings
    if (tags.exif?.FocalLength?.description) {
      exifData.focalLength = tags.exif.FocalLength.description
    }
    if (tags.exif?.FNumber?.description) {
      exifData.aperture = tags.exif.FNumber.description
    }
    if (tags.exif?.ExposureTime?.description) {
      exifData.shutterSpeed = tags.exif.ExposureTime.description
    }
    if (tags.exif?.ISOSpeedRatings?.description) {
      exifData.iso = Number.parseInt(tags.exif.ISOSpeedRatings.description, 10)
    }

    // Date taken
    if (tags.exif?.DateTimeOriginal?.description) {
      // Convert EXIF date format (YYYY:MM:DD HH:mm:ss) to ISO format
      const dateStr = tags.exif.DateTimeOriginal.description
      const isoDate = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
      exifData.takenAt = new Date(isoDate).toISOString()
    }

    // GPS location
    if (tags.gps?.Latitude && tags.gps?.Longitude) {
      exifData.latitude = tags.gps.Latitude
      exifData.longitude = tags.gps.Longitude
    }

    // Only return if we found at least some EXIF data
    return Object.keys(exifData).length > 0 ? exifData : null
  } catch (error) {
    console.error('Error extracting EXIF data:', error)
    return null
  }
}
