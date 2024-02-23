const AFEW_SHOT_EXAMPLES = `
input:
[
  {
    "issue_link": "https://stackoverflow.com/questions/63206407/rgb-to-grayscale-with-tensorflow-2-3-getting-dimensions-must-be-equal-error",
    "issue_title": "rgb_to_grayscale with tensorflow 2.3, getting \\"dimensions must be equal error\\"",
    "issue_body": "I'm a tensorflow noob, sorry. I am following this tutorial: https://www.tensorflow.org/tutorials/images/segmentation     I want to apply some preprocessing to the images in the dataset, and rgb_to_grayscale is failing with the error below. My median filter works, just not rbg_to_grayscale.     I would really appreciate any advice you have.     @tf.function     def load_image_train(datapoint):       input_image = tf.image.resize(datapoint['image'], (128, 128))       input_mask = tf.image.resize(datapoint['segmentation_mask'], (128, 128))         print(type(input_image))       print(input_image.shape)       input_image = tf.image.rgb_to_grayscale(input_image)       input_mask = tf.image.rgb_to_grayscale(input_mask)       input_image = tfa.image.median_filter2d(input_image)       input_mask = tfa.image.median_filter2d(input_mask)    print output:     <class 'tensorflow.python.framework.ops.Tensor'>     (128, 128, 3)     Errror received:         tutorial.py:36 load_image_train  *             input_mask = tf.image.rgb_to_grayscale(input_mask)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/util/dispatch.py:201 wrapper  **             return target(*args, **kwargs)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/ops/image_ops_impl.py:2136 rgb_to_grayscale             gray_float = math_ops.tensordot(flt_image, rgb_weights, [-1, -1])         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/util/dispatch.py:201 wrapper             return target(*args, **kwargs)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/ops/math_ops.py:4519 tensordot             ab_matmul = matmul(a_reshape, b_reshape)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/util/dispatch.py:201 wrapper             return target(*args, **kwargs)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/ops/math_ops.py:3255 matmul             a, b, transpose_a=transpose_a, transpose_b=transpose_b, name=name)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/ops/gen_math_ops.py:5642 mat_mul             name=name)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/framework/op_def_library.py:744 _apply_op_helper             attrs=attr_protos, op_def=op_def)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/framework/func_graph.py:593 _create_op_internal             compute_device)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/framework/ops.py:3485 _create_op_internal             op_def=op_def)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/framework/ops.py:1975 __init__             control_input_ops, op_def)         /home/dmattie/environments/imgproc/lib/python3.7/site-packages/tensorflow/python/framework/ops.py:1815 _create_c_op             raise ValueError(str(e))         ValueError: Dimensions must be equal, but are 1 and 3 for '{{node rgb_to_grayscale_1/Tensordot/MatMul}} = MatMul[T=DT_FLOAT, transpose_a=false, transpose_b=false](rgb_to_grayscale_1/Tensordot/Reshape, rgb_to_grayscale_1/Tensordot/Reshape_1)' with input shapes: [16384,1], [3,1].",
    "answer_1": "The shape of input_mask is (128,128,1) so that when it gets flattened there is only one value in the last axis. This makes it incompatible with tf.image.rgb_to_grayscale which requires three RGB values in the last axis. You should not be interpreting the mask as an image, but if you really want to be able to apply the greyscale to the mask values (I don't see any reason to do this), you could broadcast it: input_mask = tf.broadcast_to(input_mask, (128,128,3))"
  },  
  {
    "issue_link": "https://stackoverflow.com/questions/22591174/pandas-multiple-conditions-while-indexing-data-frame-unexpected-behavior",
    "issue_title": "pandas: multiple conditions while indexing data frame - unexpected behavior",
    "issue_body": "I am filtering rows in a dataframe by values in two columns.\\n\\nFor some reason the OR operator behaves like I would expect AND operator to behave and vice versa.\\n\\nMy test code:\\n\\ndf = pd.DataFrame({'a': range(5), 'b': range(5) })\\n\\n# let's insert some -1 values\\ndf['a'][1] = -1\\ndf['b'][1] = -1\\ndf['a'][3] = -1\\ndf['b'][4] = -1\\n\\ndf1 = df[(df.a != -1) & (df.b != -1)]\\ndf2 = df[(df.a != -1) | (df.b != -1)]\\n\\nprint(pd.concat([df, df1, df2], axis=1,\\n                keys = [ 'original df', 'using AND (&)', 'using OR (|)',]))\\nAnd the result:\\n\\n      original df      using AND (&)      using OR (|)    \\n             a  b              a   b             a   b\\n0            0  0              0   0             0   0\\n1           -1 -1            NaN NaN           NaN NaN\\n2            2  2              2   2             2   2\\n3           -1  3            NaN NaN            -1   3\\n4            4 -1            NaN NaN             4  -1\\n\\n[5 rows x 6 columns]\\nAs you can see, the AND operator drops every row in which at least one value equals -1. On the other hand, the OR operator requires both values to be equal to -1 to drop them. I would expect exactly the opposite result. Could anyone explain this behavior?\\n\\nI am using pandas 0.13.1.\\nanswers:\\n\\n1. As you can see, the AND operator drops every row in which at least one value equals -1. On the other hand, the OR operator requires both values to be equal to -1 to drop them. I would expect exactly the opposite result. Could anyone explain this behavior?"
  }
]

output:

{
  "analysis_results": [
    {
      "issue_link": "https://stackoverflow.com/questions/63206407/rgb-to-grayscale-with-tensorflow-2-3-getting-dimensions-must-be-equal-error",
      "problematic_api_exist": true,
      "reason": "The issue stems from attempting to apply tf.image.rgb_to_grayscale on a tensor that does not have the expected three channels. This API is designed to work with RGB images, but an error occurs when it is used on an image or mask with a different number of channels.",
      "api_details": {
        "library_name": "TensorFlow",
        "api_name": "tf.image.rgb_to_grayscale",
        "issue_description": "When applying tf.image.rgb_to_grayscale on a segmentation mask (which typically has a single channel), TensorFlow raises a \\"dimensions must be equal\\" error. This is because the API expects an input tensor with three channels (RGB), but the input mask only has one channel.",
        "expected_vs_actual_behavior": "The expected behavior is for rgb_to_grayscale to convert a 3-channel RGB image to a single-channel grayscale image. However, applying it to a single-channel input leads to a dimensionality error.",
        "trigger_conditions": "The issue is triggered when tf.image.rgb_to_grayscale is applied to a tensor with a shape that does not end in 3 (i.e., not an RGB image).",
        "reason_for_difficulty_in_detection": "This issue might be challenging to detect for users unfamiliar with the specific requirements of the tf.image.rgb_to_grayscale function or those who assume that it can handle inputs with any number of channels."
      }
    },
    {
      "issue_link": "https://stackoverflow.com/questions/22591174/pandas-multiple-conditions-while-indexing-data-frame-unexpected-behavior",
      "problematic_api_exist": false,
      "reason": "The behavior is due to a misunderstanding of logical operators and conditions in pandas rather than a problem with the API itself."
    }
  ]
}
`
export const CUSTOM_INSTRUCTIONS_PROMPT = `
Objective:
Classify and analyze provided software development issues to identify if they involve a problematic API exhibiting unexpected failures or unpredictable behaviors under specific runtime conditions. The goal is to ascertain whether an issue involves such an API and, if so, provide detailed information about the API and the conditions under which it fails.

Task Instructions:

For each issue provided in JSON format, follow these steps:

Classify the Issue:


1. Read the issue description and any accompanying code snippets and figure out the api in question.
2. Read the answers and figure out if the issue is related to a problematic API.
3. Determine if the API meets the following criteria, the issue must meet all of the following criteria to be considered relevant for deeper analysis:

a. The issue description directly mentions or implies a problem with an API that behaves unexpectedly under certain runtime conditions.
b. The issue description indicates that the API works as expected under normal conditions but exhibits unexpected behavior under specific runtime conditions.
c. The issue does not stem from a misunderstanding of logical operators, conditions, or other non-API-related factors.
d. The issue is not a general programming question or a request for debugging assistance without a clear indication of API-related problems.
e. The issue is not a feature request or a discussion of potential improvements to an API.
f. The issue is not a request for general advice or best practices without a specific API-related problem.
g. The issue is not a discussion of theoretical or conceptual topics unrelated to specific API behavior.
h. The issue is not a request for general guidance on software development processes or methodologies.
i. The issue is not a request for help with non-technical aspects of software development, such as project management or team collaboration.
j. The issue is not related to hardware or infrastructure problems, such as server configuration or network issues.

If the issue meets the above criteria, proceed to the next step. Otherwise, provide a brief explanation of why the issue does not involve a problematic API and move on to the next issue.

Analysis and Documentation (if applicable):
If the issue involves a problematic API, provide a detailed analysis in JSON format, including the API name, library/framework, and a description of the runtime condition that leads to the unexpected behavior.

Input Format:
Receive input as a JSON object with the following structure:

type IssueList = Array<{
  issue_link: string; // URL of the issue on the platform
  issue_title: string; // Title of the issue
  issue_body: string; // Detailed description of the issue
  answer_1?: string; // First answer or response related to the issue
  answer_2?: string; // Second answer or response related to the issue
  answer_3?: string; // Third answer or response related to the issue
}>;

Output Format for Each Issue:
Provide output as a JSON object with the following structure:

type AnalysisResult = {
  analysis_results: Array<{
    issue_link: string; // URL of the issue on the platform
    problematic_api_exist: boolean; // Indicates whether a problematic API is involved
    reason: string; // Explanation of why the API is considered problematic or not
    api_details?: {
      library_name: string; // Name of the library or framework containing the API
      api_name: string; // Specific API or function name, if applicable
      issue_description?: string; // A concise explanation of the issue encountered with the API, including any error messages or incorrect behavior observed
      expected_vs_actual_behavior?: string; // Description of what the API is supposed to do under normal conditions contrasted with what actually happens
      trigger_conditions?: string; // Specific runtime conditions or sequences of events that lead to the issue
      reason_for_difficulty_in_detection?: string; // Why this issue might be challenging to detect during development and testing
    };
  }>;
};

Approach:

Initial Classification: Quickly review the issue description in the input JSON to ascertain whether it directly mentions or implies a problem with an API that behaves unexpectedly under certain conditions. This initial filter is crucial to identify relevant issues for deeper analysis.

Detailed Analysis for Relevant Issues: For issues classified as involving a problematic API, conduct a thorough investigation to fill out the detailed analysis section in the output JSON. This may involve examining the issue description, any provided code snippets, error messages, and related discussion or documentation that can shed light on the API's behavior.

Conciseness and Clarity: Aim to provide clear and concise information in JSON format. Avoid unnecessary technical jargon and ensure that the analysis is accessible to developers who might not be familiar with the specific API or framework.

Examples:
${AFEW_SHOT_EXAMPLES}

Get ready, I will provide the list of issues in JSON format in subsequent messages. reply with nothing but json.
`;