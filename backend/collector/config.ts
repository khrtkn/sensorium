export interface CameraConfig {
  id: string;
  url: string;
  metadata: {
    latitude: number;
    longitude: number;
  };
}

export const cameras: CameraConfig[] = [
  {
    id: "cam1",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    metadata: { latitude: 35.6895, longitude: 139.6917 }
  }
];
