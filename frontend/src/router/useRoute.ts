import { useEffect, useState } from "react";

export interface RouteState {
  path: string;
  query: URLSearchParams;
}

function readLocation(): RouteState {
  return { path: window.location.pathname || "/", query: new URLSearchParams(window.location.search) };
}

/** 极简 history 路由：四页跳转，配合 nginx try_files 支持直接访问与刷新 */
export function useRoute(): RouteState {
  const [route, setRoute] = useState<RouteState>(readLocation);
  useEffect(() => {
    const onChange = () => setRoute(readLocation());
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);
  return route;
}

export function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
