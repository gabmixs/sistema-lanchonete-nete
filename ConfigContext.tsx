import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppConfig {
  companyName: string;
  cnpj: string;
  address: string;
}

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
}

const defaultConfig: AppConfig = {
  companyName: 'Lanchonete do Biel',
  cnpj: '12.345.678/0001-99',
  address: 'Rua das Esfirras, 123 - Centro, Indaiatuba - SP'
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: React.PropsWithChildren<{}>) {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('app_config');
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem('app_config', JSON.stringify(config));
    // Atualiza o título da aba do navegador dinamicamente
    document.title = config.companyName;
  }, [config]);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}