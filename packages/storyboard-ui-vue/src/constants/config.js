const VIEWS = [
  'project',
  'student',
  'other'
]

const getTheme = (key) => {
  switch (key) {
    case 'other':
      return {
        mainColor: {
          cssName: '--main-color',
          cssValue: '#0d73bb'
        },
        secondaryColor: {
          cssName: '--secondary-color',
          cssValue: '#8fc640'
        },
        accentColor: {
          cssName: '--accent-color',
          cssValue: '#283e96'
        },
        brandGray: {
          cssName: '--brand-gray',
          cssValue: '#6e6f71'
        },
        backgroundColor: {
          cssName: '--background-color',
          cssValue: '#f5f5f6'
        }
      }
    default:
      return {
        mainColor: {
          cssName: '--main-color',
          cssValue: '#673ab7'
        },
        secondaryColor: {
          cssName: '--secondary-color',
          cssValue: '#087f23'
        },
        accentColor: {
          cssName: '--accent-color',
          cssValue: ''
        },
        brandGray: {
          cssName: '--brand-gray',
          cssValue: '#757575'
        },
        backgroundColor: {
          cssName: '--background-color',
          cssValue: '#f5f5f6'
        }
      }
  }
}

const getFeatures = (key) => {
  switch (key) {
    case 'project':
      return {
        denseList: false,
        schoolItems: false,
        points: false,
        filter: false,
        roster: true,
        dataBox: false,
        evidence: true
      }
    case 'other':
      return {
        denseList: true,
        schoolItems: false,
        points: false,
        filter: true,
        roster: false,
        dataBox: true,
        evidence: false
      }
    case 'student':
    default:
      /**
       * the default is effectively a demo student-level account
       */
      return {
        denseList: false,
        schoolItems: true,
        points: false,
        filter: false,
        roster: true,
        dataBox: false,
        evidence: true
      }
  }
}

const getSettings = (key) => {
  switch (key) {
    case 'project':
      return {
        itemKey: 'checkpoints',
        dataRanges: [
          'settings',
          'roster',
          'credits',
          'competencies',
          'evidence',
          'checkpoints',
          'attendance'
        ]
      }
    case 'student':
      return {
        itemKey: 'competencies',
        dataRanges: [
          'settings',
          'roster',
          'credits',
          'competencies',
          'evidence',
          'checkpoints',
          'attendance'
        ]
      }
    default:
      return {
        itemKey: 'competencies',
        dataRanges: [
          'settings',
          'roster',
          'credits',
          'competencies',
          'evidence',
          'checkpoints',
          'attendance'
        ]
      }
  }
}

const viewSwitch = process.env.VUE_APP_VIEW
export const VIEW = VIEWS[viewSwitch]
export const THEME = getTheme(VIEW)
export const FEATURES = getFeatures(VIEW)
export const SETTINGS = getSettings(VIEW)
