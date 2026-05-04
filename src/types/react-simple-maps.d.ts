declare module "react-simple-maps" {
    import { ComponentType, ReactNode, SVGProps } from "react";

    export const ComposableMap: ComponentType<
        SVGProps<SVGSVGElement> & {
            projection?: string;
            projectionConfig?: Record<string, unknown>;
            width?: number;
            height?: number;
            children?: ReactNode;
        }
    >;

    export const Geographies: ComponentType<{
        geography: string | object;
        children: (args: { geographies: any[] }) => ReactNode;
    }>;

    export const Geography: ComponentType<
        SVGProps<SVGPathElement> & {
            geography: any;
            style?: Record<string, Record<string, unknown>>;
        }
    >;
}

