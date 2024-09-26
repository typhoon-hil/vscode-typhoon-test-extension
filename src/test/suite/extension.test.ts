import { TestTreeProvider } from "../../views/TestTreeProvider";
import * as vscode from 'vscode';
import assert from "assert";
import { extractTestNameDetails } from "../../models/testMonitoring";

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Sample test', () => {
        const data = `
            test_compare.py::test_greater
            test_compare.py::test_greater_equal
            test_compare.py::test_less
            test_multiplication.py::test_multiplication_11[1-11]
            test_multiplication.py::test_multiplication_11[2-22]
            test_multiplication.py::test_multiplication_11[3-35]
            test_multiplication.py::test_multiplication_11[4-44]
            other-tests/test_div_by_13.py::test_divisible_by_13
            other-tests/test_div_by_3_6.py::test_divisible_by_3
            other-tests/test_div_by_3_6.py::test_divisible_by_6
            other-tests/test_div_by_3_6.py::test_very_slow_test
            other-tests/test_square.py::test_sqrt
            other-tests/test_square.py::testsquare
            other-tests/test_square.py::test_equality
            other-tests/failure/test_failure.py::test_sqrt_failure
            other-tests/failure/test_failure.py::test_square_failure
            other-tests/failure/test_failure.py::test_equality_failure
            tests/00_empty_test.py::test_empty
            tests/01_basic_test.py::test_example
            tests/02_special_assertions_test.py::test_div_zero_exception
            tests/02_special_assertions_test.py::test_keyerror_details
            tests/02_special_assertions_test.py::test_approximate_matches
            tests/03_simple_fixture_test.py::test_with_local_fixture
            tests/03_simple_fixture_test.py::test_with_global_fixture
            tests/04_fixture_returns_test.py::test_with_data_fixture
            tests/05_yield_fixture_test.py::test_with_yield_fixture
            tests/06_request_test.py::test_with_introspection
            tests/07_request_finalizer_test.py::test_with_safe_cleanup_fixture
            tests/08_params_test.py::test_parameterization[a]
            tests/08_params_test.py::test_parameterization[b]
            tests/08_params_test.py::test_parameterization[c]
            tests/08_params_test.py::test_parameterization[d]
            tests/08_params_test.py::test_parameterization[e]
            tests/08_params_test.py::test_modes[foo]
            tests/08_params_test.py::test_modes[bar]
            tests/08_params_test.py::test_modes[baz]
            tests/09_params-ception_test.py::test_fixtureception[a-1]
            tests/09_params-ception_test.py::test_fixtureception[a-2]
            tests/09_params-ception_test.py::test_fixtureception[a-3]
            tests/09_params-ception_test.py::test_fixtureception[a-4]
            tests/09_params-ception_test.py::test_fixtureception[b-1]
            tests/09_params-ception_test.py::test_fixtureception[b-2]
            tests/09_params-ception_test.py::test_fixtureception[b-3]
            tests/09_params-ception_test.py::test_fixtureception[b-4]
            tests/09_params-ception_test.py::test_fixtureception[c-1]
            tests/09_params-ception_test.py::test_fixtureception[c-2]
            tests/09_params-ception_test.py::test_fixtureception[c-3]
            tests/09_params-ception_test.py::test_fixtureception[c-4]
            tests/09_params-ception_test.py::test_fixtureception[d-1]
            tests/09_params-ception_test.py::test_fixtureception[d-2]
            tests/09_params-ception_test.py::test_fixtureception[d-3]
            tests/09_params-ception_test.py::test_fixtureception[d-4]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[a-1]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[a-2]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[a-3]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[a-4]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[b-1]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[b-2]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[b-3]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[b-4]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[c-1]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[c-2]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[c-3]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[c-4]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[d-1]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[d-2]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[d-3]
            tests/10_advanced_params-ception_test.py::test_advanced_fixtureception[d-4]
            tests/11_mark_test.py::test_fake_query
            tests/11_mark_test.py::test_fake_stats_function
            tests/11_mark_test.py::test_fake_multi_join_query
            tests/14_class_based_test.py::TestSimpleClass::test_two_checking_method
            tests/15_advanced_class_test.py::TestIntermediateClass::test1
            tests/15_advanced_class_test.py::TestIntermediateClass::test2
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[1]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[2]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[3]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[4]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[5]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[6]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[7]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[8]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[9]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[10]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[11]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[12]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[13]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[14]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[15]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[16]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[17]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[18]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[19]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[20]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[21]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[22]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[23]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[24]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[25]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[26]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[27]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[28]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[29]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[30]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[31]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[32]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[33]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[34]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[35]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[36]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[37]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[38]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[39]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[40]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[41]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[42]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[43]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[44]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[45]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[46]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[47]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[48]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[49]
            tests/16_scoped_and_meta_fixtures_test.py::test_scoped_fixtures[50]
            tests/19_re_usable_mock_test.py::test_re_usable_mocker
            tests/19_re_usable_mock_test.py::test_mocker_with_exception
        `.split(/\r?\n/);
        const testTreeProvider = new TestTreeProvider();
        data.forEach(line => testTreeProvider.addCollectOnlyTest(extractTestNameDetails(line)));
        
        const tests = testTreeProvider.toString();
        tests.forEach(test => console.log(test));
        assert.strictEqual(tests.length, data.length);

        data.forEach((line, index) => {
            assert.strictEqual(tests[index], line);
        });
    });

});