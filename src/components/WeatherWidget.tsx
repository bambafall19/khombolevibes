// src/components/WeatherWidget.tsx
'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Cloud } from 'lucide-react';

const WeatherWidget = () => {
  useEffect(() => {
    const scriptId = 'tomorrow-sdk';
    if (document.getElementById(scriptId)) {
        if ((window as any).__TOMORROW__) {
            (window as any).__TOMORROW__.renderWidget();
        }
        return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = "https://www.tomorrow.io/v1/widget/sdk/sdk.bundle.min.js";
    script.async = true;

    script.onload = () => {
      if ((window as any).__TOMORROW__) {
          (window as any).__TOMORROW__.renderWidget();
      }
    }

    document.body.appendChild(script);

  }, []);

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <div className="flex items-center gap-3">
                <Cloud className="w-6 h-6 text-primary"/>
                <CardTitle className="font-headline text-2xl">Météo à Khombole</CardTitle>
            </div>
             <CardDescription>La météo en temps réel.</CardDescription>
        </CardHeader>
        <CardContent>
            <div
                className="tomorrow"
                data-location-id="104723"
                data-language="EN"
                data-unit-system="METRIC"
                data-skin="light"
                data-widget-type="summary"
                style={{ paddingBottom: '22px', position: 'relative' }}
            >
                <a
                    href="https://www.tomorrow.io/weather/"
                    rel="nofollow noopener noreferrer"
                    target="_blank"
                    style={{ position: 'absolute', bottom: 0, transform: 'translateX(-50%)', left: '50%' }}
                >
                    <img
                        alt="Powered by Tomorrow.io"
                        src="https://weather-website-client.tomorrow.io/img/powered-by.svg"
                        width="250"
                        height="18"
                    />
                </a>
            </div>
        </CardContent>
    </Card>
  );
};

export default WeatherWidget;
