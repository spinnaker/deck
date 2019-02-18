import { IArtifactKindConfig } from 'core/domain';

import { Base64Match, Base64Default } from './base64/Base64ArtifactEditor';
import { BitbucketMatch, BitbucketDefault } from './bitbucket/BitbucketArtifactEditor';
import { CustomMatch } from './custom/CustomArtifactEditor';
import { DockerMatch, DockerDefault } from './docker/DockerArtifactEditor';
import { GcsMatch, GcsDefault } from './gcs/GcsArtifactEditor';
import { GithubMatch, GithubDefault } from './github/GithubArtifactEditor';
import { GitlabMatch, GitlabDefault } from './gitlab/GitlabArtifactEditor';
import { HelmMatch, HelmDefault } from './helm/HelmArtifactEditor';
import { HttpMatch, HttpDefault } from './http/HttpArtifactEditor';
import { IvyMatch, IvyDefault } from './ivy/IvyArtifactEditor';
import { MavenMatch, MavenDefault } from './maven/MavenArtifactEditor';
import { S3Match, S3Default } from './s3/S3ArtifactEditor';

export const ArtifactKindConfigs: IArtifactKindConfig[] = [
  Base64Match,
  Base64Default,
  BitbucketMatch,
  BitbucketDefault,
  CustomMatch,
  DockerMatch,
  DockerDefault,
  GcsMatch,
  GcsDefault,
  GithubMatch,
  GithubDefault,
  GitlabMatch,
  GitlabDefault,
  HelmMatch,
  HelmDefault,
  HttpMatch,
  HttpDefault,
  IvyMatch,
  IvyDefault,
  MavenMatch,
  MavenDefault,
  S3Match,
  S3Default,
];

export * from './TriggerArtifactConstraintSelector';
