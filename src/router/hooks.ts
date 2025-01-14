import {
  NavigateOptions,
  useNavigate as useRouterNavigate,
  useParams as useRouterParams,
  useSearchParams,
} from 'react-router-dom'
import { RouteParams, RoutePath } from './types'

export interface TypedNavigateOptions extends Omit<NavigateOptions, 'state'> {
  replace?: boolean
  relative?: 'route' | 'path'
  state?: any
}

export function useTypedNavigate() {
  const navigate = useRouterNavigate()

  return {
    navigate: <Path extends RoutePath>(path: Path, params?: RouteParams[Path], options?: TypedNavigateOptions) => {
      let resolvedPath = path as string
      if (params) {
        Object.entries(params as Record<string, string>).forEach(([key, value]) => {
          resolvedPath = resolvedPath.replace(`:${key}`, value)
        })
      }
      navigate(resolvedPath, options)
    },
    replace: <Path extends RoutePath>(
      path: Path,
      params?: RouteParams[Path],
      options?: Omit<TypedNavigateOptions, 'replace'>,
    ) => {
      let resolvedPath = path as string
      if (params) {
        Object.entries(params as Record<string, string>).forEach(([key, value]) => {
          resolvedPath = resolvedPath.replace(`:${key}`, value)
        })
      }
      navigate(resolvedPath, { ...options, replace: true })
    },
  }
}

type ParamValue<Path extends RoutePath> = RouteParams[Path] extends undefined
  ? Record<string, never>
  : RouteParams[Path]

export function useTypedParams<Path extends RoutePath>(): ParamValue<Path> {
  const params = useRouterParams()
  return params as ParamValue<Path>
}

export function useTypedSearchParams() {
  return useSearchParams()
}
