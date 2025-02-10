export type ModelType = {
  name: string;
  nickname: string;
  description: string;
};

export interface LorebookType {
  id: number;
  title: string;
  trigger: string[];
  content: string;
}

export type NovelConfigType = {
  model: string;
  prompt: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  presence_penalty: number;
  frequency_penalty: number;
};

export type DataSessionType = {
  user_id: string;
};

export type BlurImageDataType = {
  img: {
    src: string;
    height: number;
    width: number;
  };
  color: {
    r: number;
    g: number;
    b: number;
    hex: string;
  };
  css: {
    backgroundImage: string;
    backgroundPosition: string;
    backgroundSize: string;
    backgroundRepeat: string;
  };
  base64: string;
  pixels: {
    a?: number | undefined;
    r: number;
    g: number;
    b: number;
  }[][];
  message: string;
};

export interface IDataSharing {
  models?: ModelType[];
}
