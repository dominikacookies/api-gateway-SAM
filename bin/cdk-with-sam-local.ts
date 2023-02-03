#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PrivateRssApiStack } from '../lib/privateRssApiStack';

const targetEnv = process.env.TARGET_ENV;

const app = new cdk.App();
new PrivateRssApiStack(app, targetEnv + 'PrivRssStack', {
  targetEnv,
});
