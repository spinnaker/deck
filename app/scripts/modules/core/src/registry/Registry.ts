import { PipelineRegistry } from 'core/pipeline/config/PipelineRegistry';
import { UrlBuilderRegistry } from 'core/navigation/UrlBuilderRegistry';
import { DebugWindow } from 'core/utils/consoleDebug';

export class Registry {
  public static pipeline: PipelineRegistry = new PipelineRegistry();
  public static urlBuilder: UrlBuilderRegistry = new UrlBuilderRegistry();

  public static reinitialize = () => {
    Registry.pipeline = new PipelineRegistry();
    Registry.urlBuilder = new UrlBuilderRegistry();
  };
}

DebugWindow.Registry = Registry;
