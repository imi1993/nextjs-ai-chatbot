export type VisualSpec = {
  style: 'raffine' | 'sondage';
  kicker: string;
  headline: string;
  /** Poll choices, only for the "sondage" style. */
  options?: Array<string>;
};

export type SlideSpec = {
  kind: 'cover' | 'list' | 'steps' | 'benefits' | 'cta';
  title: string;
  items?: Array<string>;
  body?: string;
};

export type VideoSpec = {
  script: string;
  heygenId?: string;
  status?: 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
};

export type PostMedia = {
  visual?: VisualSpec;
  slides?: Array<SlideSpec>;
  video?: VideoSpec;
};
