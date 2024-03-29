import React from 'react'
import * as remote from '@electron/remote'
import { withNamespaces } from 'react-i18next'
import { FormGroup } from '@blueprintjs/core'

import { Section, Wrapper, FillAvailable } from '../components/section'
import { FolderPickerConfig } from '../components/folder-picker'
import { RadioConfig } from '../components/radio'
import { SwitchConfig } from '../components/switch'

const screenshotPathExclude = [window.ROOT]
const defaultScreenshotPath = remote.getGlobal('DEFAULT_SCREENSHOT_PATH')

export const ScreenshotConfig = withNamespaces(['setting'])(({ t }) => (
  <Section title={t('Screenshot')}>
    <Wrapper>
      <Wrapper>
        <FormGroup inline label={t('setting:Format')}>
          <RadioConfig
            label={t('setting:Screenshot Format')}
            configName="poi.misc.screenshot.format"
            defaultValue="png"
            availableVal={[
              { name: 'PNG', value: 'png' },
              { name: 'JPEG', value: 'jpg' },
            ]}
          />
        </FormGroup>
        <SwitchConfig
          label={t('setting:Capture screenshot using canvas directly')}
          configName="poi.misc.screenshot.usecanvas"
          defaultValue={false}
        />
      </Wrapper>

      <FillAvailable>
        <FormGroup inline label={t('setting:Save to')}>
          <FolderPickerConfig
            label={t('setting:Screenshot Folder')}
            configName="poi.misc.screenshot.path"
            defaultValue={defaultScreenshotPath}
            exclude={screenshotPathExclude}
          />
        </FormGroup>
      </FillAvailable>
    </Wrapper>
  </Section>
))
